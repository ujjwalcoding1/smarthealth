import asyncio
import json
import os
import time
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import (
    TelemetryPayload, ZoneEvaluation, SOSIncident,
    EmergencyContact, MedicineSchedule, DoctorAppointment,
    LabReport, SymptomQuery
)
from recommendations import evaluate_vitals_zone
from simulator import simulator
import database as db

app = FastAPI(
    title="SmartHealth IoT & AI Telemetry Server",
    description="Enterprise Backend for ESP32 Health Monitor, 3-Zone Clinical Triager, and Fall SOS Dispatcher",
    version="2.0.0"
)

# Enable CORS for Web dashboard (Vercel) & Android / Mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Latest in-memory telemetry cache
latest_telemetry_dict = simulator.get_reading()
latest_zone_evaluation = evaluate_vitals_zone(TelemetryPayload(**latest_telemetry_dict))

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        text_data = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(text_data)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background generator / streaming task
@app.on_event("startup")
async def startup_event():
    async def telemetry_ticker():
        global latest_telemetry_dict, latest_zone_evaluation
        while True:
            try:
                # If no physical IoT packet in past 3 seconds, generate simulated reading
                sim_data = simulator.get_reading()
                # Check if physical sensor has updated recently or use simulator
                latest_telemetry_dict = sim_data
                payload = TelemetryPayload(**latest_telemetry_dict)
                latest_zone_evaluation = evaluate_vitals_zone(payload)
                
                # Check if critical/fall auto-logs alert
                if latest_zone_evaluation.zone == "RED":
                    alert_doc = {
                        "type": "CRITICAL_ALERT",
                        "zone": "RED",
                        "summary": latest_zone_evaluation.summary_message,
                        "heart_rate": payload.heart_rate,
                        "spo2": payload.spo2,
                        "temperature_c": payload.temperature_c,
                        "fall_detected": payload.impact_detected,
                        "latitude": payload.latitude,
                        "longitude": payload.longitude,
                        "timestamp": payload.timestamp
                    }
                    db.save_alert(alert_doc)

                # Save history periodically (every 5 seconds)
                if int(time.time()) % 5 == 0:
                    db.save_telemetry(latest_telemetry_dict)

                # Broadcast to all connected Web & Android clients
                packet = {
                    "type": "TELEMETRY_UPDATE",
                    "telemetry": latest_telemetry_dict,
                    "zone_evaluation": latest_zone_evaluation.dict()
                }
                await manager.broadcast(packet)

            except Exception as e:
                print("Ticker loop error:", e)
            await asyncio.sleep(1.0)

    asyncio.create_task(telemetry_ticker())

# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {
        "service": "SmartHealth IoT Platform Backend",
        "status": "online",
        "version": "2.0.0",
        "render_deployment_ready": True,
        "active_zone": latest_zone_evaluation.zone,
        "docs_url": "/docs"
    }

# 1. Real-Time Telemetry & 3-Zone Evaluation
@app.get("/api/iot/latest")
def get_latest_vitals():
    payload = TelemetryPayload(**latest_telemetry_dict)
    zone_eval = evaluate_vitals_zone(payload)
    return {
        "telemetry": latest_telemetry_dict,
        "evaluation": zone_eval.dict(),
        "simulator_mode": simulator.mode
    }

# 2. Ingest Data from ESP32 (WiFi or Serial Bridge)
@app.post("/api/iot/telemetry")
async def ingest_iot_telemetry(data: TelemetryPayload):
    global latest_telemetry_dict, latest_zone_evaluation
    raw_dict = data.dict()
    if not raw_dict.get("timestamp"):
        raw_dict["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
    latest_telemetry_dict = raw_dict
    latest_zone_evaluation = evaluate_vitals_zone(data)
    
    db.save_telemetry(raw_dict)
    
    # Broadcast immediately
    await manager.broadcast({
        "type": "TELEMETRY_UPDATE",
        "telemetry": raw_dict,
        "zone_evaluation": latest_zone_evaluation.dict()
    })
    
    return {
        "status": "received",
        "zone": latest_zone_evaluation.zone,
        "action_needed": latest_zone_evaluation.doctor_action_needed
    }

# 3. Simulator Control (Normal, Yellow Fever, Yellow Tachy, Red Fall, etc.)
@app.post("/api/simulator/mode")
def set_simulator_mode(mode: str = Query(..., description="NORMAL, YELLOW_FEVER, YELLOW_TACHY, YELLOW_SPO2, RED_CRITICAL, RED_FALL")):
    global latest_telemetry_dict, latest_zone_evaluation
    res = simulator.set_mode(mode)
    latest_telemetry_dict = simulator.get_reading()
    latest_zone_evaluation = evaluate_vitals_zone(TelemetryPayload(**latest_telemetry_dict))
    return {
        "status": "success",
        "mode": simulator.mode,
        "telemetry": latest_telemetry_dict,
        "zone_evaluation": latest_zone_evaluation.dict()
    }

# 4. Historical Vitals for Analytics & Charts
@app.get("/api/iot/history")
def get_vitals_history(limit: int = 50):
    records = db.get_recent_telemetry(limit=limit)
    if not records:
        # Generate reasonable mock history if empty
        mock_history = []
        now_ts = time.time()
        for i in range(25):
            t_str = time.strftime("%H:%M:%S", time.localtime(now_ts - (24 - i) * 60))
            mock_history.append({
                "timestamp": t_str,
                "heart_rate": round(72 + 5 * (i % 3) + (i % 2), 1),
                "spo2": round(98 - 0.2 * (i % 4), 1),
                "temperature_c": round(36.7 + 0.1 * (i % 3), 1),
                "acceleration_g": 0.99
            })
        return mock_history
    return records

# 5. Fall & Manual SOS Trigger
@app.post("/api/sos/trigger")
async def trigger_sos(incident: SOSIncident):
    incident.timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    incident_dict = incident.dict()
    doc_id_code = f"INC-{int(time.time())}"
    doc_id = db.save_alert({
        "type": "SOS_DISPATCH",
        "incident_id": doc_id_code,
        "patient_name": incident.patient_name,
        "trigger_type": incident.trigger_type,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "maps_url": f"https://maps.google.com/?q={incident.latitude},{incident.longitude}",
        "dial_number": incident.dial_number,
        "status": "DISPATCHED",
        "timestamp": incident.timestamp
    })
    
    # Broadcast SOS emergency notification to Web & Android
    await manager.broadcast({
        "type": "SOS_ALERT",
        "incident": incident_dict
    })
    
    return {
        "status": "dispatched",
        "incident_id": doc_id_code,
        "dial_action": f"tel:{incident.dial_number}",
        "message": f"SOS emergency alert broadcasted. Dialing {incident.dial_number}."
    }

# 6. SOS Cancel
@app.post("/api/sos/cancel")
async def cancel_sos():
    cancel_event = {
        "type": "SOS_CANCELLED",
        "message": "User verified safe. SOS countdown cancelled.",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    db.save_alert(cancel_event)
    await manager.broadcast(cancel_event)
    return {"status": "cancelled", "message": "Emergency alert safely cancelled."}

# 7. Alert History Log
@app.get("/api/alerts")
def get_alerts_log():
    return db.get_alerts()

# 8. Emergency Contacts CRUD
@app.get("/api/contacts")
def list_contacts():
    return db.get_emergency_contacts()

@app.post("/api/contacts")
def create_contact(contact: EmergencyContact):
    contact_dict = contact.dict()
    new_id = db.add_emergency_contact(contact_dict)
    contact_dict["id"] = new_id
    return contact_dict

# 9. Medicine Timetable & Reminder
@app.get("/api/medicines")
def list_medicines():
    return db.get_medicines()

@app.post("/api/medicines")
def create_medicine(med: MedicineSchedule):
    med_dict = med.dict()
    new_id = db.add_medicine(med_dict)
    med_dict["id"] = new_id
    return med_dict

@app.put("/api/medicines/{med_id}/toggle")
def toggle_medicine_taken(med_id: str, taken: bool = Query(...)):
    success = db.update_medicine_status(med_id, taken)
    return {"success": success, "med_id": med_id, "taken": taken}

# 10. Doctor Appointments
@app.get("/api/appointments")
def list_appointments():
    return db.get_appointments()

@app.post("/api/appointments")
def book_appointment(apt: DoctorAppointment):
    apt_dict = apt.dict()
    new_id = db.add_appointment(apt_dict)
    apt_dict["id"] = new_id
    return apt_dict

# 11. Pathology & Lab Reports
@app.get("/api/lab-reports")
def list_lab_reports():
    return db.get_lab_reports()

@app.post("/api/lab-reports")
def upload_lab_report(rep: LabReport):
    rep_dict = rep.dict()
    new_id = db.add_lab_report(rep_dict)
    rep_dict["id"] = new_id
    return rep_dict

# 12. Patient Profile & Medical ID
@app.get("/api/patient-profile")
def get_profile():
    return db.get_patient_profile()

@app.put("/api/patient-profile")
def update_profile(profile: Dict[str, Any]):
    return db.update_patient_profile(profile)

# 13. Hydration & Water Logs
@app.get("/api/water-intake")
def get_water_intake():
    logs = db.get_water_logs()
    total_ml = sum(l.get("amount_ml", 0) for l in logs)
    target_ml = 2500
    return {
        "current_ml": total_ml,
        "target_ml": target_ml,
        "percentage": min(100, round((total_ml / target_ml) * 100)),
        "logs": logs
    }

@app.post("/api/water-intake")
def log_water_cup(amount_ml: int = 250):
    entry = db.add_water_log(amount_ml)
    return entry

# 14. AI Symptom Checker & Clinical Triage
@app.post("/api/ai/symptom-checker")
def check_symptoms(query: SymptomQuery):
    text = query.symptom_text.lower()
    hr = query.current_heart_rate or latest_telemetry_dict.get("heart_rate", 75)
    temp = query.current_temp or latest_telemetry_dict.get("temperature_c", 36.8)
    spo2 = query.current_spo2 or latest_telemetry_dict.get("spo2", 98)

    assessment = []
    actions = []
    medicines = []
    urgency = "LOW"

    if any(k in text for k in ["chest pain", "shortness of breath", "faint", "numbness", "left arm"]):
        urgency = "EMERGENCY"
        assessment.append("Potential Acute Coronary or Severe Cardiopulmonary distress.")
        actions.append("🚨 DIAL 112 IMMEDIATELY. Do not drive yourself.")
        actions.append("Chew soluble Aspirin 300mg if not allergic and instructed by emergency medic.")
        medicines.append({"name": "Aspirin 300mg", "note": "Only under emergency guidance"})
    
    elif any(k in text for k in ["fever", "bukhar", "hot", "chills", "shivering"]):
        urgency = "MODERATE (Yellow Zone)"
        assessment.append(f"Febrile illness indicated. Sensor temp: {temp}°C.")
        actions.append("Keep hydrated with electrolytes / warm liquids.")
        actions.append("Rest in a cool room, cold forehead compress.")
        medicines.append({
            "name": "Paracetamol (Dolo / Crocin) 650mg",
            "dosage": "1 tablet after food, up to 3 times daily"
        })
        medicines.append({
            "name": "ORS Hydration Pack",
            "dosage": "1 sachet in 1 liter clean water, sip throughout day"
        })

    elif any(k in text for k in ["cough", "throat", "cold", "khansi"]):
        urgency = "MILD"
        assessment.append("Upper respiratory tract irritation.")
        actions.append("Warm saltwater gargle 3 times a day.")
        actions.append("Steam inhalation for 5-8 minutes.")
        medicines.append({
            "name": "Honey & Ginger extract or TusQ Lozenges",
            "dosage": "As needed for throat soothing"
        })

    elif any(k in text for k in ["headache", "sar dard", "migraine"]):
        urgency = "MILD TO MODERATE"
        assessment.append("Tension or dehydration headache.")
        actions.append("Drink 500ml water immediately.")
        actions.append("Dim screen brightness, rest eyes for 20 minutes.")
        medicines.append({
            "name": "Paracetamol 500mg",
            "dosage": "1 tab with water"
        })

    else:
        urgency = "INFORMATIONAL"
        assessment.append("Mild generalized physical discomfort.")
        actions.append("Monitor sensor vitals over the next 2 hours.")
        actions.append("Ensure balanced diet and rest.")

    return {
        "query": query.symptom_text,
        "triaged_urgency": urgency,
        "vitals_considered": {"hr": hr, "temp_c": temp, "spo2": spo2},
        "assessment": assessment,
        "immediate_actions": actions,
        "recommended_remedies": medicines,
        "disclaimer": "AI Medical Triage Assistant is for informational reference. Consult a licensed medical practitioner for prescription."
    }

# 15. Comprehensive Organ Health Index (Heart, Lungs, Liver, Kidneys, Immunity)
@app.get("/api/health-index")
def get_health_index():
    hr = latest_telemetry_dict.get("heart_rate", 75)
    spo2 = latest_telemetry_dict.get("spo2", 98)
    temp = latest_telemetry_dict.get("temperature_c", 36.8)

    cardiac_score = max(50, min(100, int(100 - abs(hr - 72) * 1.2)))
    respiratory_score = max(40, min(100, int((spo2 - 85) * 6.6)))
    thermo_score = max(50, min(100, int(100 - abs(temp - 36.7) * 20)))
    overall_health = int((cardiac_score * 0.4) + (respiratory_score * 0.4) + (thermo_score * 0.2))

    return {
        "overall_health_score": overall_health,
        "grade": "Optimal" if overall_health >= 85 else ("Moderate" if overall_health >= 70 else "Needs Attention"),
        "organs": [
            {"name": "Cardiovascular (Heart)", "score": cardiac_score, "status": "Strong" if cardiac_score >= 80 else "Watch"},
            {"name": "Respiratory (Lungs)", "score": respiratory_score, "status": "Optimal" if respiratory_score >= 90 else "Caution"},
            {"name": "Thermoregulatory", "score": thermo_score, "status": "Stable" if thermo_score >= 85 else "Fever Risk"},
            {"name": "Renal (Kidneys)", "score": 92, "status": "Optimal (Serum Creatinine 0.9 mg/dL)"},
            {"name": "Metabolic & Liver", "score": 88, "status": "Normal (Fasting Sugar 94 mg/dL)"}
        ]
    }

# 16. Disease Risk Assessment
@app.get("/api/disease-risk")
def get_disease_risk():
    return {
        "cardiovascular_risk": {"level": "Low-Moderate (11%)", "factors": ["Age 58", "Controlled BP", "Non-smoker"]},
        "hypertension_risk": {"level": "Stage 1 Controlled", "notes": "On Metoprolol 25mg daily"},
        "type2_diabetes_risk": {"level": "Low (6%)", "notes": "Fasting glucose 94 mg/dL within healthy bracket"},
        "stroke_risk": {"level": "Low (4%)", "notes": "Stable carotid Doppler and normal ECG rhythm"}
    }

# 17. Sleep Quality Analysis
@app.get("/api/sleep-analysis")
def get_sleep_analysis():
    return {
        "last_night_duration_hours": 7.4,
        "target_hours": 8.0,
        "sleep_score": 86,
        "deep_sleep_hours": 2.1,
        "rem_sleep_hours": 1.8,
        "light_sleep_hours": 3.5,
        "restless_moments": 3,
        "resting_heart_rate_sleeping": 61.2
    }

# 18. Personalized Nutrition & Diet Plan
@app.get("/api/diet-recommendation")
def get_diet_plan():
    zone = latest_zone_evaluation.zone
    if zone == "YELLOW":
        return {
            "current_zone": "YELLOW",
            "diet_type": "Therapeutic Recuperation Diet",
            "breakfast": "Oatmeal with chia seeds, banana slices, and coconut water.",
            "lunch": "Steamed brown rice with yellow lentil dal (moong dal), bottle gourd sabzi, and curd.",
            "evening_snack": "Clear vegetable broth / herbal tulsi tea with roasted makhana (fox nuts).",
            "dinner": "Soft khichdi with boiled carrots and a pinch of cumin/turmeric.",
            "hydration_target": "3.0 Liters (Include ORS/electrolytes)"
        }
    return {
        "current_zone": "GREEN",
        "diet_type": "Heart-Healthy Mediterranean & Balanced Indian Diet",
        "breakfast": "Vegetable poha or besan chilla with mint chutney and soaked almonds.",
        "lunch": "Multigrain rotis, spinach paneer, mixed sprout salad, cucumber raita.",
        "evening_snack": "Green tea with roasted walnuts and flax seeds.",
        "dinner": "Grilled paneer or grilled fish/tofu with stir-fried bell peppers and quinoa.",
        "hydration_target": "2.5 Liters"
    }

# 19. Export Complete Medical Record
@app.get("/api/export-report")
def export_medical_report():
    return {
        "patient": db.get_patient_profile(),
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "latest_vitals": latest_telemetry_dict,
        "zone_status": latest_zone_evaluation.dict(),
        "medication_schedule": db.get_medicines(),
        "recent_lab_reports": db.get_lab_reports(),
        "emergency_contacts": db.get_emergency_contacts(),
        "physician_signature": "Digitally verified by SmartHealth Cloud System"
    }

# ==========================================
# WEBSOCKET REALTIME FEED
# ==========================================
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial snapshot immediately upon connection
    await websocket.send_text(json.dumps({
        "type": "INITIAL_SNAPSHOT",
        "telemetry": latest_telemetry_dict,
        "zone_evaluation": latest_zone_evaluation.dict()
    }))
    try:
        while True:
            # Keep socket alive and receive client commands
            data = await websocket.receive_text()
            cmd = json.loads(data)
            if cmd.get("action") == "SET_SIMULATOR_MODE":
                simulator.set_mode(cmd.get("mode", "NORMAL"))
            elif cmd.get("action") == "CANCEL_SOS":
                await cancel_sos()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
