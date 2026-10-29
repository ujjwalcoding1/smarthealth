import os
import time
import json
import uuid
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smarthealth")

# In-Memory & Local Storage Store with MongoDB-compatible API
class FallbackStore:
    def __init__(self):
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "telemetry": [],
            "alerts": [],
            "contacts": [
                {
                    "id": "c1",
                    "name": "Emergency Services",
                    "relationship": "National Ambulance / SOS",
                    "phone": "112",
                    "is_primary": True,
                    "notify_sms": True,
                    "notify_call": True
                },
                {
                    "id": "c2",
                    "name": "Dr. Sameer Verma",
                    "relationship": "Primary Cardiologist",
                    "phone": "+919876543210",
                    "is_primary": False,
                    "notify_sms": True,
                    "notify_call": True
                },
                {
                    "id": "c3",
                    "name": "Ananya Sharma (Daughter)",
                    "relationship": "Family Guardian",
                    "phone": "+919811223344",
                    "is_primary": False,
                    "notify_sms": True,
                    "notify_call": True
                }
            ],
            "medicines": [
                {
                    "id": "m1",
                    "name": "Metoprolol Succinate",
                    "dosage": "25mg",
                    "frequency": "Once daily",
                    "timing": "08:00 AM",
                    "meal_relation": "After Breakfast",
                    "purpose": "Blood pressure & heart rate regulation",
                    "taken_today": True,
                    "stock_count": 28
                },
                {
                    "id": "m2",
                    "name": "Atorvastatin",
                    "dosage": "10mg",
                    "frequency": "Once daily",
                    "timing": "08:30 PM",
                    "meal_relation": "After Dinner",
                    "purpose": "Cholesterol & lipid management",
                    "taken_today": False,
                    "stock_count": 14
                },
                {
                    "id": "m3",
                    "name": "Vitamin D3 (Cholecalciferol)",
                    "dosage": "60,000 IU",
                    "frequency": "Weekly (Sunday)",
                    "timing": "10:00 AM",
                    "meal_relation": "With Milk",
                    "purpose": "Bone & immunity support",
                    "taken_today": True,
                    "stock_count": 8
                },
                {
                    "id": "m4",
                    "name": "Paracetamol (SOS)",
                    "dosage": "650mg",
                    "frequency": "As needed (Max 3/day)",
                    "timing": "When fever > 37.5°C",
                    "meal_relation": "After Food",
                    "purpose": "Fever & body ache relief (Yellow Zone)",
                    "taken_today": False,
                    "stock_count": 20
                }
            ],
            "appointments": [
                {
                    "id": "apt1",
                    "doctor_name": "Dr. Sameer Verma, MD, DM",
                    "specialty": "Cardiology",
                    "hospital": "Max Super Speciality Hospital, New Delhi",
                    "date": "Tomorrow, 11:30 AM",
                    "time": "11:30 AM",
                    "mode": "Teleconsultation",
                    "status": "Confirmed",
                    "consultation_notes": "Routine 3-month review of ECG & MAX30102 pulse logs."
                },
                {
                    "id": "apt2",
                    "doctor_name": "Dr. Priya Sengupta, MD",
                    "specialty": "Internal Medicine",
                    "hospital": "Apollo Health City",
                    "date": "Next Monday, 04:00 PM",
                    "time": "04:00 PM",
                    "mode": "In-Clinic",
                    "status": "Scheduled",
                    "consultation_notes": "Follow up on seasonal fever and general vitals screening."
                }
            ],
            "lab_reports": [
                {
                    "id": "lab1",
                    "test_name": "Lipid Profile - Total Cholesterol",
                    "date": "24 Oct 2026",
                    "result_value": "178 mg/dL",
                    "reference_range": "< 200 mg/dL",
                    "status": "Normal",
                    "category": "Cardiac"
                },
                {
                    "id": "lab2",
                    "test_name": "Fasting Blood Glucose",
                    "date": "24 Oct 2026",
                    "result_value": "94 mg/dL",
                    "reference_range": "70 - 100 mg/dL",
                    "status": "Normal",
                    "category": "Endocrine"
                },
                {
                    "id": "lab3",
                    "test_name": "Serum Creatinine",
                    "date": "24 Oct 2026",
                    "result_value": "0.9 mg/dL",
                    "reference_range": "0.7 - 1.2 mg/dL",
                    "status": "Normal",
                    "category": "Kidney"
                },
                {
                    "id": "lab4",
                    "test_name": "Complete Blood Count (Hemoglobin)",
                    "date": "24 Oct 2026",
                    "result_value": "14.2 g/dL",
                    "reference_range": "13.0 - 17.0 g/dL",
                    "status": "Normal",
                    "category": "Hematology"
                }
            ],
            "patient_profile": {
                "name": "Rajesh Sharma",
                "age": 58,
                "gender": "Male",
                "blood_group": "B+",
                "height_cm": 174,
                "weight_kg": 72,
                "allergies": ["Penicillin", "Dust Mites"],
                "chronic_conditions": ["Mild Hypertension (controlled)"],
                "emergency_notes": "Allergic to penicillin. Wears ESP32 IoT band with MAX30102 and MPU6050."
            },
            "water_logs": [
                {"time": "08:00 AM", "amount_ml": 300},
                {"time": "10:30 AM", "amount_ml": 250},
                {"time": "01:00 PM", "amount_ml": 400},
                {"time": "03:30 PM", "amount_ml": 300},
                {"time": "06:00 PM", "amount_ml": 350}
            ]
        }

    def insert(self, collection: str, doc: Dict[str, Any]) -> str:
        if "id" not in doc:
            doc["id"] = str(uuid.uuid4())[:8]
        if collection not in self.data:
            self.data[collection] = []
        self.data[collection].append(doc)
        # Cap telemetry in memory to 500 items
        if collection == "telemetry" and len(self.data[collection]) > 500:
            self.data[collection] = self.data[collection][-500:]
        return doc["id"]

    def find(self, collection: str, limit: int = 50, sort_desc: bool = True) -> List[Dict[str, Any]]:
        items = self.data.get(collection, [])
        if sort_desc:
            return list(reversed(items))[:limit]
        return items[:limit]

    def update(self, collection: str, doc_id: str, updates: Dict[str, Any]) -> bool:
        items = self.data.get(collection, [])
        for item in items:
            if item.get("id") == doc_id:
                item.update(updates)
                return True
        return False

    def delete(self, collection: str, doc_id: str) -> bool:
        items = self.data.get(collection, [])
        for i, item in enumerate(items):
            if item.get("id") == doc_id:
                del items[i]
                return True
        return False

store = FallbackStore()
mongo_client = None
db = None

try:
    from pymongo import MongoClient
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    # verify connection
    mongo_client.server_info()
    db = mongo_client[DB_NAME]
    print(f"Connected successfully to MongoDB at {MONGODB_URI}")
except Exception as e:
    print(f"MongoDB not connected ({e}). Using robust in-memory database store.")
    mongo_client = None
    db = None

def get_db():
    return db

def save_telemetry(payload: Dict[str, Any]):
    payload["timestamp"] = payload.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
    store.insert("telemetry", payload)
    if db is not None:
        try:
            db.telemetry.insert_one(payload.copy())
        except Exception as e:
            print("MongoDB insert failed:", e)

def get_recent_telemetry(limit: int = 50) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            cursor = db.telemetry.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
            return list(cursor)
        except Exception:
            pass
    return store.find("telemetry", limit=limit)

def save_alert(alert_data: Dict[str, Any]):
    alert_data["timestamp"] = alert_data.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
    doc_id = store.insert("alerts", alert_data)
    if db is not None:
        try:
            db.alerts.insert_one(alert_data.copy())
        except Exception:
            pass
    return doc_id

def get_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            cursor = db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
            return list(cursor)
        except Exception:
            pass
    return store.find("alerts", limit=limit)

def get_emergency_contacts() -> List[Dict[str, Any]]:
    return store.find("contacts", limit=20, sort_desc=False)

def add_emergency_contact(contact: Dict[str, Any]):
    return store.insert("contacts", contact)

def get_medicines() -> List[Dict[str, Any]]:
    return store.find("medicines", limit=50, sort_desc=False)

def update_medicine_status(med_id: str, taken: bool):
    return store.update("medicines", med_id, {"taken_today": taken})

def add_medicine(med: Dict[str, Any]):
    return store.insert("medicines", med)

def get_appointments() -> List[Dict[str, Any]]:
    return store.find("appointments", limit=20, sort_desc=False)

def add_appointment(apt: Dict[str, Any]):
    return store.insert("appointments", apt)

def get_lab_reports() -> List[Dict[str, Any]]:
    return store.find("lab_reports", limit=50, sort_desc=False)

def add_lab_report(rep: Dict[str, Any]):
    return store.insert("lab_reports", rep)

def get_patient_profile() -> Dict[str, Any]:
    return store.data.get("patient_profile", {})

def update_patient_profile(profile: Dict[str, Any]):
    store.data["patient_profile"].update(profile)
    return store.data["patient_profile"]

def get_water_logs():
    return store.data.get("water_logs", [])

def add_water_log(amount_ml: int):
    entry = {"time": time.strftime("%I:%M %p"), "amount_ml": amount_ml}
    store.data.setdefault("water_logs", []).append(entry)
    return entry
