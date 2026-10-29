import asyncio
import json
import os
import time
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import (
    TelemetryPayload, ZoneEvaluation, SOSConfig,
    DoctorItem, HospitalClinicItem, MedicineItem,
    GovSchemeItem, ConsultationBooking, SymptomQuery
)
from recommendations import evaluate_vitals_zone
from simulator import simulator
from ai_doctor import analyze_and_prescribe
import database as db

app = FastAPI(
    title="SmartHealth IoT, AI Healthcare & Administration Platform",
    description="Enterprise Backend for Patient Lifeline, Doctor/Hospital Management, Medicine Prescription Engine, and SOS Dispatch",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_telemetry_dict = simulator.get_reading()
latest_zone_evaluation = evaluate_vitals_zone(TelemetryPayload(**latest_telemetry_dict))

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

@app.on_event("startup")
async def startup_event():
    async def telemetry_ticker():
        global latest_telemetry_dict, latest_zone_evaluation
        while True:
            try:
                sim_data = simulator.get_reading()
                latest_telemetry_dict = sim_data
                payload = TelemetryPayload(**latest_telemetry_dict)
                latest_zone_evaluation = evaluate_vitals_zone(payload)

                if latest_zone_evaluation.zone == "RED":
                    cfg = db.get_sos_config()
                    alert_doc = {
                        "type": "CRITICAL_ALERT",
                        "zone": "RED",
                        "summary": latest_zone_evaluation.summary_message,
                        "heart_rate": payload.heart_rate,
                        "spo2": payload.spo2,
                        "temperature_c": payload.temperature_c,
                        "fall_detected": payload.impact_detected,
                        "primary_sos_dial": cfg.get("primary_sos_number", "112"),
                        "timestamp": payload.timestamp
                    }
                    db.save_alert(alert_doc)

                if int(time.time()) % 5 == 0:
                    db.save_telemetry(latest_telemetry_dict)

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
        "service": "SmartHealth Cloud Backend & Admin Hub",
        "status": "online",
        "version": "3.0.0",
        "active_zone": latest_zone_evaluation.zone,
        "docs_url": "/docs"
    }

# 1. Telemetry & Zones
@app.get("/api/iot/latest")
def get_latest_vitals():
    payload = TelemetryPayload(**latest_telemetry_dict)
    zone_eval = evaluate_vitals_zone(payload)
    sos_cfg = db.get_sos_config()
    return {
        "telemetry": latest_telemetry_dict,
        "evaluation": zone_eval.dict(),
        "sos_config": sos_cfg,
        "simulator_mode": simulator.mode
    }

@app.post("/api/iot/telemetry")
async def ingest_iot_telemetry(data: TelemetryPayload):
    global latest_telemetry_dict, latest_zone_evaluation
    raw_dict = data.dict()
    if not raw_dict.get("timestamp"):
        raw_dict["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
    latest_telemetry_dict = raw_dict
    latest_zone_evaluation = evaluate_vitals_zone(data)

    db.save_telemetry(raw_dict)
    await manager.broadcast({
        "type": "TELEMETRY_UPDATE",
        "telemetry": raw_dict,
        "zone_evaluation": latest_zone_evaluation.dict()
    })

    return {
        "status": "received",
        "zone": latest_zone_evaluation.zone,
        "fall_detected": data.impact_detected
    }

@app.post("/api/simulator/mode")
def set_simulator_mode(mode: str = Query(...)):
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

# 2. SOS Configuration Management (User can change dial number)
@app.get("/api/sos/config")
def get_sos_settings():
    return db.get_sos_config()

@app.put("/api/sos/config")
def update_sos_settings(config: SOSConfig):
    return db.update_sos_config(config.dict())

@app.post("/api/sos/trigger")
async def trigger_emergency_sos(incident: Dict[str, Any]):
    cfg = db.get_sos_config()
    target_dial = incident.get("dial_number") or cfg.get("primary_sos_number", "112")
    incident_doc = {
        "type": "SOS_DISPATCH",
        "incident_id": f"INC-{int(time.time())}",
        "patient_name": incident.get("patient_name", "Rajesh Sharma"),
        "trigger_type": incident.get("trigger_type", "FALL_DETECTION"),
        "heart_rate": incident.get("heart_rate", latest_telemetry_dict.get("heart_rate")),
        "temperature_c": incident.get("temperature_c", latest_telemetry_dict.get("temperature_c")),
        "latitude": incident.get("latitude", latest_telemetry_dict.get("latitude", 28.6139)),
        "longitude": incident.get("longitude", latest_telemetry_dict.get("longitude", 77.2090)),
        "dial_number": target_dial,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    db.save_alert(incident_doc)
    await manager.broadcast({
        "type": "SOS_ALERT",
        "incident": incident_doc
    })
    return {
        "status": "dispatched",
        "dial_action": f"tel:{target_dial}",
        "message": f"Calling emergency number {target_dial}"
    }

@app.post("/api/sos/cancel")
async def cancel_sos():
    cancel_event = {
        "type": "SOS_CANCELLED",
        "message": "User safely cancelled the countdown.",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    db.save_alert(cancel_event)
    await manager.broadcast(cancel_event)
    return {"status": "cancelled"}

# 3. Doctors Management CRUD
@app.get("/api/doctors")
def list_doctors():
    return db.get_doctors()

@app.post("/api/doctors")
def create_doctor(doc: DoctorItem):
    doc_dict = doc.dict()
    new_id = db.add_doctor(doc_dict)
    doc_dict["id"] = new_id
    return doc_dict

@app.put("/api/doctors/{doc_id}")
def edit_doctor(doc_id: str, doc: DoctorItem):
    doc_dict = doc.dict()
    success = db.update_doctor(doc_id, doc_dict)
    return {"success": success, "doctor": doc_dict}

@app.delete("/api/doctors/{doc_id}")
def remove_doctor(doc_id: str):
    success = db.delete_doctor(doc_id)
    return {"success": success}

# 4. Hospitals & Clinics Management CRUD
@app.get("/api/hospitals")
def list_hospitals():
    return db.get_hospitals()

@app.post("/api/hospitals")
def create_hospital(hosp: HospitalClinicItem):
    hosp_dict = hosp.dict()
    new_id = db.add_hospital(hosp_dict)
    hosp_dict["id"] = new_id
    return hosp_dict

@app.put("/api/hospitals/{hosp_id}")
def edit_hospital(hosp_id: str, hosp: HospitalClinicItem):
    hosp_dict = hosp.dict()
    success = db.update_hospital(hosp_id, hosp_dict)
    return {"success": success, "hospital": hosp_dict}

@app.delete("/api/hospitals/{hosp_id}")
def remove_hospital(hosp_id: str):
    success = db.delete_hospital(hosp_id)
    return {"success": success}

# 5. Medicines Management CRUD
@app.get("/api/medicines")
def list_medicines():
    return db.get_medicines()

@app.post("/api/medicines")
def create_medicine(med: MedicineItem):
    med_dict = med.dict()
    new_id = db.add_medicine(med_dict)
    med_dict["id"] = new_id
    return med_dict

@app.put("/api/medicines/{med_id}")
def edit_medicine(med_id: str, med: MedicineItem):
    med_dict = med.dict()
    success = db.update_medicine(med_id, med_dict)
    return {"success": success, "medicine": med_dict}

@app.delete("/api/medicines/{med_id}")
def remove_medicine(med_id: str):
    success = db.delete_medicine(med_id)
    return {"success": success}

# 6. Government Health Portals & Schemes
@app.get("/api/gov-schemes")
def list_gov_schemes():
    return db.get_gov_schemes()

@app.post("/api/gov-schemes")
def create_gov_scheme(scheme: GovSchemeItem):
    scheme_dict = scheme.dict()
    new_id = db.add_gov_scheme(scheme_dict)
    scheme_dict["id"] = new_id
    return scheme_dict

# 7. Real Consultation Booking with FormSubmit.co & WhatsApp Integrations
@app.post("/api/consultations/book")
def book_consultation(booking: ConsultationBooking):
    booking.timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    booking_dict = booking.dict()
    
    # Attach real-time sensor vitals snapshot
    booking_dict["vitals_snapshot"] = {
        "heart_rate": latest_telemetry_dict.get("heart_rate", 75),
        "temperature_c": latest_telemetry_dict.get("temperature_c", 36.8),
        "spo2": latest_telemetry_dict.get("spo2", 98),
        "active_zone": latest_zone_evaluation.zone
    }

    doc_id = db.save_consultation(booking_dict)
    booking_dict["id"] = doc_id

    # Format structured WhatsApp message for doctor
    doc_phone = booking.doctor_whatsapp or "919876543210"
    clean_phone = "".join(filter(str.isdigit, doc_phone))
    
    wa_text = (
        f"🏥 *SMARTHEALTH APPOINTMENT REQUEST*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"👤 *Patient Name:* {booking.patient_name} ({booking.age}y/{booking.gender})\n"
        f"📱 *Phone:* {booking.patient_phone}\n"
        f"📧 *Email:* {booking.patient_email}\n"
        f"👨‍⚕️ *Consulting Doctor:* {booking.doctor_name}\n"
        f"📅 *Preferred Slot:* {booking.preferred_date} at {booking.preferred_time}\n"
        f"🩺 *Mode:* {booking.consultation_mode}\n"
        f"📝 *Symptoms:* {booking.symptoms_description}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"📡 *Live IoT Vitals:* HR: {booking_dict['vitals_snapshot']['heart_rate']} BPM | "
        f"Temp: {booking_dict['vitals_snapshot']['temperature_c']}°C | "
        f"SpO2: {booking_dict['vitals_snapshot']['spo2']}%\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Please reply with appointment confirmation. Thank you!"
    )

    import urllib.parse
    encoded_wa = urllib.parse.quote(wa_text)
    whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_wa}"

    # FormSubmit.co URL endpoint
    formsubmit_url = f"https://formsubmit.co/{booking.patient_email}"

    return {
        "status": "confirmed",
        "booking_id": doc_id,
        "whatsapp_url": whatsapp_url,
        "formsubmit_url": formsubmit_url,
        "structured_message": wa_text,
        "booking": booking_dict
    }

@app.get("/api/consultations")
def list_consultations():
    return db.get_consultations()

# 8. AI Doctor Chatbot & Prescription Engine
@app.post("/api/ai/prescribe")
def chatbot_prescribe(query: SymptomQuery):
    vitals = {
        "heart_rate": query.current_heart_rate or latest_telemetry_dict.get("heart_rate", 75),
        "temperature_c": query.current_temp or latest_telemetry_dict.get("temperature_c", 36.8),
        "spo2": query.current_spo2 or latest_telemetry_dict.get("spo2", 98)
    }
    result = analyze_and_prescribe(query.symptom_text, vitals)
    return result

# 9. Real-time WebSocket
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    await websocket.send_text(json.dumps({
        "type": "INITIAL_SNAPSHOT",
        "telemetry": latest_telemetry_dict,
        "zone_evaluation": latest_zone_evaluation.dict()
    }))
    try:
        while True:
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
