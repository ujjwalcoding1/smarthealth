import os
import time
import json
import uuid
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from medicines_catalog import COMPREHENSIVE_MEDICINES

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smarthealth")

class FallbackStore:
    def __init__(self):
        self.data: Dict[str, Any] = {
            "telemetry": [],
            "alerts": [],
            "sos_config": {
                "primary_sos_number": "112",
                "secondary_guardian_number": "+919811223344",
                "secondary_guardian_name": "Family Guardian",
                "ambulance_number": "108",
                "doctor_phone": "+919876543210",
                "doctor_name": "Dr. Sameer Verma",
                "auto_dial_delay_seconds": 10,
                "enable_sms_alert": True,
                "custom_message": "EMERGENCY: Patient fell or requires urgent medical attention!"
            },
            "caregiver_config": {
                "caregiver_name": "Ananya (Daughter)",
                "email": "guardian.care@smarthealth.org",
                "relationship": "Primary Guardian",
                "phone": "+919811223344",
                "dose_tokens": [
                    { "id": "TKN-101", "med_name": "Dolo 650mg", "dosage": "1 tab", "time": "08:30 AM", "meal": "After Food", "taken": True },
                    { "id": "TKN-102", "med_name": "Telma 40mg", "dosage": "1 tab", "time": "01:30 PM", "meal": "After Lunch", "taken": False },
                    { "id": "TKN-103", "med_name": "Atorva 10mg", "dosage": "1 tab", "time": "09:00 PM", "meal": "At Bedtime", "taken": False }
                ]
            },
            "doctors": [
                {
                    "id": "doc1",
                    "name": "Dr. Sameer Verma",
                    "specialty": "Cardiology & Interventional Cardiologist",
                    "qualification": "MBBS, MD (Medicine), DM (Cardiology), FACC",
                    "experience_years": 16,
                    "hospital_clinic_name": "Max Super Speciality Hospital",
                    "location": "Saket, New Delhi",
                    "phone": "+919876543210",
                    "whatsapp_number": "919876543210",
                    "email": "dr.verma@maxhealthcare.com",
                    "consultation_fee": 1000,
                    "available_days": "Mon, Wed, Fri, Sat",
                    "available_time": "10:00 AM - 02:00 PM, 05:00 PM - 08:00 PM",
                    "photo_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                    "rating": 4.9
                },
                {
                    "id": "doc2",
                    "name": "Dr. Priya Sengupta",
                    "specialty": "General Medicine & Diabetology",
                    "qualification": "MBBS, MD (Internal Medicine), PGD (Diabetology)",
                    "experience_years": 12,
                    "hospital_clinic_name": "Apollo Clinic & Healthcare",
                    "location": "Connaught Place, Central Delhi",
                    "phone": "+919812345678",
                    "whatsapp_number": "919812345678",
                    "email": "dr.priya@apolloclinic.com",
                    "consultation_fee": 700,
                    "available_days": "Mon - Sat",
                    "available_time": "09:30 AM - 01:30 PM, 04:30 PM - 07:30 PM",
                    "photo_url": "https://images.unsplash.com/photo-1594824813628-9d41c8f42fa0?w=400&auto=format&fit=crop&q=80",
                    "rating": 4.8
                },
                {
                    "id": "doc3",
                    "name": "Dr. Rajeshwar Kulkarni",
                    "specialty": "Pulmonology & Chest Specialist",
                    "qualification": "MBBS, MD (Pulmonary Medicine), FCCP",
                    "experience_years": 14,
                    "hospital_clinic_name": "Fortis Escorts Heart & Lung Institute",
                    "location": "Okhla Road, New Delhi",
                    "phone": "+919823456789",
                    "whatsapp_number": "919823456789",
                    "email": "dr.kulkarni@fortishealthcare.com",
                    "consultation_fee": 900,
                    "available_days": "Tue, Thu, Sat",
                    "available_time": "11:00 AM - 04:00 PM",
                    "photo_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
                    "rating": 4.9
                },
                {
                    "id": "doc4",
                    "name": "Dr. Anita Deshmukh",
                    "specialty": "Neurology & Stroke Management",
                    "qualification": "MBBS, MD, DM (Neurology)",
                    "experience_years": 18,
                    "hospital_clinic_name": "AIIMS Medical Center",
                    "location": "Ansari Nagar, New Delhi",
                    "phone": "+919834567890",
                    "whatsapp_number": "919834567890",
                    "email": "dr.anita@aiims.edu",
                    "consultation_fee": 600,
                    "available_days": "Mon, Wed, Fri",
                    "available_time": "09:00 AM - 01:00 PM",
                    "photo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                    "rating": 4.95
                }
            ],
            "hospitals": [
                {
                    "id": "hosp1",
                    "name": "Max Super Speciality Hospital",
                    "category": "Multi-Speciality Hospital & Trauma Center",
                    "address": "1, 2, Press Enclave Road, Saket",
                    "city": "New Delhi",
                    "state": "Delhi",
                    "pincode": "110017",
                    "emergency_phone": "+91-11-26515050",
                    "reception_phone": "+91-11-66115050",
                    "email": "emergency@maxhealthcare.com",
                    "emergency_24x7": True,
                    "ambulance_available": True,
                    "facilities": ["24/7 Cardiac Cath Lab", "Level 1 Trauma ICU", "Blood Bank", "Advanced Ventilators", "24/7 Pharmacy"],
                    "photo_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80",
                    "google_maps_url": "https://maps.google.com/?q=28.5273,77.2144",
                    "rating": 4.8
                },
                {
                    "id": "hosp2",
                    "name": "All India Institute of Medical Sciences (AIIMS)",
                    "category": "Apex National Referral Hospital",
                    "address": "Sri Aurobindo Marg, Ansari Nagar",
                    "city": "New Delhi",
                    "state": "Delhi",
                    "pincode": "110029",
                    "emergency_phone": "108 / 011-26588500",
                    "reception_phone": "011-26588700",
                    "email": "info@aiims.edu",
                    "emergency_24x7": True,
                    "ambulance_available": True,
                    "facilities": ["24/7 Emergency Wing", "Burn Care", "Organ Transplant Center", "Govt Subsidized Care", "Air Ambulance Heliport"],
                    "photo_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
                    "google_maps_url": "https://maps.google.com/?q=28.5672,77.2100",
                    "rating": 4.9
                },
                {
                    "id": "hosp3",
                    "name": "Fortis Escorts Heart Institute",
                    "category": "Dedicated Cardiac Super-Speciality",
                    "address": "Okhla Road, Sukhdev Vihar Metro Station",
                    "city": "New Delhi",
                    "state": "Delhi",
                    "pincode": "110025",
                    "emergency_phone": "+91-11-47135000",
                    "reception_phone": "+91-11-26825000",
                    "email": "escorts@fortishealthcare.com",
                    "emergency_24x7": True,
                    "ambulance_available": True,
                    "facilities": ["24/7 Heart Attack Center", "Cardiac Ambulance", "Pediatric Heart Surgery", "ECMO Support"],
                    "photo_url": "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&auto=format&fit=crop&q=80",
                    "google_maps_url": "https://maps.google.com/?q=28.5606,77.2818",
                    "rating": 4.85
                }
            ],
            "medicines": [dict(m) for m in COMPREHENSIVE_MEDICINES],
            "gov_schemes": [
                {
                    "id": "gov1",
                    "scheme_name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                    "authority": "National Health Authority (NHA), Ministry of Health & Family Welfare",
                    "category": "Cashless Health Insurance (₹5 Lakhs/Family)",
                    "description": "World's largest government-funded healthcare assurance scheme providing health cover of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization across India.",
                    "benefits": "Cashless inpatient hospital care at over 28,000 empaneled public & private hospitals. Covers pre-existing conditions, ICU charges, surgeries, diagnostics, and medicines.",
                    "eligibility": "Families identified under SECC 2011 database, rural deprivation criteria, and urban occupational categories. Check eligibility with Aadhaar or Ration Card.",
                    "helpline_number": "14555 / 1800-111-565",
                    "official_portal_url": "https://pmjay.gov.in"
                },
                {
                    "id": "gov2",
                    "scheme_name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
                    "authority": "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
                    "category": "Affordable Generic Medicines (50% to 90% Savings)",
                    "description": "Special government pharmacies providing quality generic medicines, surgical devices, and nutraceuticals at 50% to 90% cheaper prices than branded market alternatives.",
                    "benefits": "Over 1,900 essential medicines and 290 surgical devices available at designated Jan Aushadhi Kendras in almost every district across the country.",
                    "eligibility": "Open to all Indian citizens without any income criteria. Valid doctor prescription required for Rx drugs.",
                    "helpline_number": "1800-180-8080",
                    "official_portal_url": "https://janaushadhi.gov.in"
                },
                {
                    "id": "gov3",
                    "scheme_name": "Emergency 108 / 102 National Ambulance Service",
                    "authority": "National Health Mission (NHM)",
                    "category": "24x7 Free Emergency Medical Response",
                    "description": "Toll-free 24x7 emergency ambulance network providing Basic Life Support (BLS) and Advanced Life Support (ALS) ambulances equipped with oxygen, defibrillators, and paramedics.",
                    "benefits": "Free rapid transport for trauma accidents, cardiac arrests, stroke, maternal emergencies, and critical patient transfer to nearest government or empaneled hospitals.",
                    "eligibility": "Free for all emergency situations.",
                    "helpline_number": "108 (Emergency Trauma / Critical) / 102 (Maternal & Child)",
                    "official_portal_url": "https://nhm.gov.in"
                },
                {
                    "id": "gov4",
                    "scheme_name": "e-RaktKosh National Blood Bank Network",
                    "authority": "Ministry of Health & Family Welfare",
                    "category": "Live Blood Stock & Donor Portal",
                    "description": "Centralized portal linking over 3,000 licensed blood banks across India. Allows patients and doctors to check live blood group availability in real-time.",
                    "benefits": "Find nearby blood bank inventory, request emergency blood units, find voluntary blood donation camps.",
                    "eligibility": "Available for all patients in emergency need.",
                    "helpline_number": "104 (Health Helpline) / 011-23063233",
                    "official_portal_url": "https://eraktkosh.mohfw.gov.in"
                },
                {
                    "id": "gov5",
                    "scheme_name": "Ayushman Bharat Health Account (ABHA Card)",
                    "authority": "National Digital Health Mission (NDHM)",
                    "category": "Digital Medical Records & Unique Health ID",
                    "description": "14-digit unique digital health identification enabling patients to securely store and share electronic health records, lab reports, and prescriptions with verified doctors across India.",
                    "benefits": "Paperless hospital check-in, unified lab history, verified digital consent for second opinions.",
                    "eligibility": "Any citizen with Aadhaar or Mobile number.",
                    "helpline_number": "14477",
                    "official_portal_url": "https://abha.abdm.gov.in"
                }
            ],
            "consultations": []
        }

    def insert(self, collection: str, doc: Dict[str, Any]) -> str:
        if "id" not in doc:
            doc["id"] = str(uuid.uuid4())[:8]
        if collection not in self.data:
            self.data[collection] = []
        self.data[collection].append(doc)
        if collection == "telemetry" and len(self.data[collection]) > 500:
            self.data[collection] = self.data[collection][-500:]
        return doc["id"]

    def find(self, collection: str, limit: int = 100, sort_desc: bool = True) -> List[Dict[str, Any]]:
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
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000, connectTimeoutMS=1000)
    mongo_client.server_info()
    db = mongo_client[DB_NAME]
    print(f"Connected successfully to MongoDB at {MONGODB_URI}")
except Exception as e:
    print(f"MongoDB offline/unreachable ({e}). Using robust fallback database store.")
    mongo_client = None
    db = None

# Telemetry
def save_telemetry(payload: Dict[str, Any]):
    payload["timestamp"] = payload.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
    store.insert("telemetry", payload)
    if db is not None:
        try:
            db.telemetry.insert_one(payload.copy())
        except Exception:
            pass

def get_recent_telemetry(limit: int = 50) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.telemetry.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
        except Exception:
            pass
    return store.find("telemetry", limit=limit)

# Alerts
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
            return list(db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
        except Exception:
            pass
    return store.find("alerts", limit=limit)

# SOS Config
def get_sos_config() -> Dict[str, Any]:
    if db is not None:
        try:
            cfg = db.sos_config.find_one({}, {"_id": 0})
            if cfg:
                return cfg
        except Exception:
            pass
    return store.data.get("sos_config", {})

def update_sos_config(config: Dict[str, Any]):
    store.data["sos_config"].update(config)
    if db is not None:
        try:
            db.sos_config.update_one({}, {"$set": config}, upsert=True)
        except Exception:
            pass
    return store.data["sos_config"]

# Doctors CRUD
def get_doctors() -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.doctors.find({}, {"_id": 0}))
        except Exception:
            pass
    return store.find("doctors", limit=100, sort_desc=False)

def add_doctor(doc: Dict[str, Any]) -> str:
    new_id = store.insert("doctors", doc)
    if db is not None:
        try:
            db.doctors.insert_one(doc.copy())
        except Exception:
            pass
    return new_id

def update_doctor(doc_id: str, updates: Dict[str, Any]) -> bool:
    success = store.update("doctors", doc_id, updates)
    if db is not None:
        try:
            db.doctors.update_one({"id": doc_id}, {"$set": updates})
        except Exception:
            pass
    return success

def delete_doctor(doc_id: str) -> bool:
    success = store.delete("doctors", doc_id)
    if db is not None:
        try:
            db.doctors.delete_one({"id": doc_id})
        except Exception:
            pass
    return success

# Hospitals & Clinics CRUD
def get_hospitals() -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.hospitals.find({}, {"_id": 0}))
        except Exception:
            pass
    return store.find("hospitals", limit=100, sort_desc=False)

def add_hospital(hosp: Dict[str, Any]) -> str:
    new_id = store.insert("hospitals", hosp)
    if db is not None:
        try:
            db.hospitals.insert_one(hosp.copy())
        except Exception:
            pass
    return new_id

def update_hospital(hosp_id: str, updates: Dict[str, Any]) -> bool:
    success = store.update("hospitals", hosp_id, updates)
    if db is not None:
        try:
            db.hospitals.update_one({"id": hosp_id}, {"$set": updates})
        except Exception:
            pass
    return success

def delete_hospital(hosp_id: str) -> bool:
    success = store.delete("hospitals", hosp_id)
    if db is not None:
        try:
            db.hospitals.delete_one({"id": hosp_id})
        except Exception:
            pass
    return success

# Medicines CRUD
def get_medicines() -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.medicines.find({}, {"_id": 0}))
        except Exception:
            pass
    return store.find("medicines", limit=200, sort_desc=False)

def add_medicine(med: Dict[str, Any]) -> str:
    new_id = store.insert("medicines", med)
    if db is not None:
        try:
            db.medicines.insert_one(med.copy())
        except Exception:
            pass
    return new_id

def update_medicine(med_id: str, updates: Dict[str, Any]) -> bool:
    success = store.update("medicines", med_id, updates)
    if db is not None:
        try:
            db.medicines.update_one({"id": med_id}, {"$set": updates})
        except Exception:
            pass
    return success

def delete_medicine(med_id: str) -> bool:
    success = store.delete("medicines", med_id)
    if db is not None:
        try:
            db.medicines.delete_one({"id": med_id})
        except Exception:
            pass
    return success

# Government Schemes CRUD
def get_gov_schemes() -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.gov_schemes.find({}, {"_id": 0}))
        except Exception:
            pass
    return store.find("gov_schemes", limit=50, sort_desc=False)

def add_gov_scheme(scheme: Dict[str, Any]) -> str:
    new_id = store.insert("gov_schemes", scheme)
    if db is not None:
        try:
            db.gov_schemes.insert_one(scheme.copy())
        except Exception:
            pass
    return new_id

# Real Consultations Booking
def save_consultation(booking: Dict[str, Any]) -> str:
    booking["timestamp"] = booking.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
    new_id = store.insert("consultations", booking)
    if db is not None:
        try:
            db.consultations.insert_one(booking.copy())
        except Exception:
            pass
    return new_id

def get_consultations() -> List[Dict[str, Any]]:
    if db is not None:
        try:
            return list(db.consultations.find({}, {"_id": 0}))
        except Exception:
            pass
    return store.find("consultations", limit=100)

# Caregiver Remote Watch & Dose Tokens Configuration
def get_caregiver_config() -> Dict[str, Any]:
    if db is not None:
        try:
            cfg = db.caregiver_config.find_one({}, {"_id": 0})
            if cfg:
                return cfg
        except Exception:
            pass
    return store.data.get("caregiver_config", {})

def update_caregiver_config(config: Dict[str, Any]) -> Dict[str, Any]:
    if "caregiver_config" not in store.data:
        store.data["caregiver_config"] = {}
    store.data["caregiver_config"].update(config)
    if db is not None:
        try:
            db.caregiver_config.update_one({}, {"$set": config}, upsert=True)
        except Exception:
            pass
    return store.data["caregiver_config"]

