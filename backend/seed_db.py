"""
SmartHealth - MongoDB Database Seeder
Seeds initial clinical data, doctors, hospitals, comprehensive medicines catalog,
government schemes, SOS configurations, and caregiver records into MongoDB Atlas.
"""

import os
import sys
import time
from typing import Dict, Any, List
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"))

from medicines_catalog import COMPREHENSIVE_MEDICINES

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://ujjwalcoding:Ujjwal123@smarthealth.soydk5u.mongodb.net/?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "smarthealth")

INITIAL_DOCTORS = [
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
]

INITIAL_HOSPITALS = [
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
]

INITIAL_GOV_SCHEMES = [
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
]

INITIAL_SOS_CONFIG = {
    "primary_sos_number": "+919811223344",
    "primary_contact_name": "My Phone (Primary Contact)",
    "alert_email": "emergency.alert@smarthealth.org",
    "secondary_guardian_number": "+919811223344",
    "secondary_guardian_name": "Family Guardian",
    "ambulance_number": "108",
    "doctor_phone": "+919876543210",
    "doctor_name": "Dr. Sameer Verma",
    "auto_dial_delay_seconds": 10,
    "enable_sms_alert": True,
    "enable_email_alert": True,
    "custom_message": "EMERGENCY: Patient fell or requires urgent medical attention!"
}

INITIAL_CAREGIVER_CONFIG = {
    "caregiver_name": "Ananya (Daughter)",
    "email": "guardian.care@smarthealth.org",
    "relationship": "Primary Guardian",
    "phone": "+919811223344",
    "dose_tokens": [
        { "id": "TKN-101", "med_name": "Dolo 650mg", "dosage": "1 tab", "time": "08:30 AM", "meal": "After Food", "taken": True },
        { "id": "TKN-102", "med_name": "Telma 40mg", "dosage": "1 tab", "time": "01:30 PM", "meal": "After Lunch", "taken": False },
        { "id": "TKN-103", "med_name": "Atorva 10mg", "dosage": "1 tab", "time": "09:00 PM", "meal": "At Bedtime", "taken": False }
    ]
}

INITIAL_TELEMETRY = {
    "device_id": "ESP32-HARDWARE",
    "heart_rate": 72.0,
    "spo2": 98.0,
    "ir_value": 65000,
    "red_value": 62000,
    "temperature_c": 36.8,
    "temperature_f": 98.24,
    "ax": 0.02,
    "ay": -0.01,
    "az": 0.99,
    "acceleration_g": 1.0,
    "impact_detected": False,
    "finger_detected": True,
    "sensor_source": "INITIAL_SEED",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "satellites": 8,
    "gps_valid": True,
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
}

INITIAL_ALERT = {
    "type": "SYSTEM_INITIALIZED",
    "level": "INFO",
    "message": "SmartHealth Patient Monitoring System initialized and MongoDB connected.",
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
}

def connect_to_mongodb():
    """Connect to MongoDB with certifi SSL certificate and fallback."""
    from pymongo import MongoClient

    # Try 1: Standard certifi CA bundle
    try:
        import certifi
        ca_file = certifi.where()
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsCAFile=ca_file)
        client.server_info()
        print("[OK] Connected to MongoDB Atlas via certifi CA bundle.")
        return client
    except Exception as e1:
        # Try 2: Allow invalid certificates (for development/testing networks)
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
            client.server_info()
            print("[OK] Connected to MongoDB Atlas via TLS fallback.")
            return client
        except Exception as e2:
            print(f"\n[ERROR] Connection failed to MongoDB Atlas at {MONGODB_URI}")
            print(f"Details: {e2}")
            return None

def seed_database():
    print("=" * 65)
    print(" SmartHealth MongoDB Atlas Seeding Tool")
    print(f" Target Database: {DB_NAME}")
    print("=" * 65)

    client = connect_to_mongodb()
    if client is None:
        print("\n" + "=" * 65)
        print(" [!] MONGODB ATLAS NETWORK ACCESS REQUIRED")
        print("=" * 65)
        print("MongoDB Atlas rejected the SSL handshake (TLS alert 80).")
        print("This means the current network's IP is not on the Atlas IP Whitelist.")
        print("\nTo resolve this:")
        print("1. Log in to your MongoDB Atlas account (https://cloud.mongodb.com)")
        print("2. In the left sidebar under 'Security', click 'Network Access'")
        print("3. Click '+ Add IP Address'")
        print("4. Click 'Add Current IP Address' OR 'Allow Access from Anywhere' (0.0.0.0/0)")
        print("5. Click 'Confirm' and wait ~1 minute for it to become Active")
        print("6. Run this seed script again!")
        print("=" * 65 + "\n")
        return False

    db = client[DB_NAME]

    print("\n--> Seeding Doctors...")
    for doc in INITIAL_DOCTORS:
        db.doctors.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    print(f"    [+] Seeded/Upserted {len(INITIAL_DOCTORS)} doctors.")

    print("\n--> Seeding Hospitals & Clinics...")
    for hosp in INITIAL_HOSPITALS:
        db.hospitals.update_one({"id": hosp["id"]}, {"$set": hosp}, upsert=True)
    print(f"    [+] Seeded/Upserted {len(INITIAL_HOSPITALS)} hospitals.")

    print("\n--> Seeding Comprehensive Clinical Medicines...")
    med_count = 0
    for med in COMPREHENSIVE_MEDICINES:
        med_dict = dict(med)
        db.medicines.update_one({"id": med_dict["id"]}, {"$set": med_dict}, upsert=True)
        med_count += 1
    print(f"    [+] Seeded/Upserted {med_count} medicines.")

    print("\n--> Seeding Government Health Schemes...")
    for scheme in INITIAL_GOV_SCHEMES:
        db.gov_schemes.update_one({"id": scheme["id"]}, {"$set": scheme}, upsert=True)
    print(f"    [+] Seeded/Upserted {len(INITIAL_GOV_SCHEMES)} government schemes.")

    print("\n--> Seeding SOS Emergency Configuration...")
    db.sos_config.update_one({}, {"$set": INITIAL_SOS_CONFIG}, upsert=True)
    print("    [+] Seeded SOS emergency configuration.")

    print("\n--> Seeding Remote Caregiver Watch & Dose Tokens...")
    db.caregiver_config.update_one({}, {"$set": INITIAL_CAREGIVER_CONFIG}, upsert=True)
    print("    [+] Seeded Caregiver configuration and dose tokens.")

    print("\n--> Checking Telemetry Collection...")
    if db.telemetry.count_documents({}) == 0:
        db.telemetry.insert_one(INITIAL_TELEMETRY.copy())
        print("    [+] Inserted baseline telemetry record.")
    else:
        print(f"    [*] Telemetry already contains {db.telemetry.count_documents({})} records.")

    print("\n--> Checking Alerts Collection...")
    if db.alerts.count_documents({}) == 0:
        db.alerts.insert_one(INITIAL_ALERT.copy())
        print("    [+] Inserted system initialization alert.")
    else:
        print(f"    [*] Alerts already contains {db.alerts.count_documents({})} records.")

    print("\n" + "=" * 65)
    print(" SEEDING SUMMARY IN MONGODB ATLAS:")
    print("=" * 65)
    collections = [
        "doctors",
        "hospitals",
        "medicines",
        "gov_schemes",
        "sos_config",
        "caregiver_config",
        "telemetry",
        "alerts",
        "consultations",
        "voice_consultations",
        "chat_history"
    ]
    for coll in collections:
        cnt = db[coll].count_documents({})
        print(f"  * {coll:<22}: {cnt} documents")
    print("=" * 65)
    print("[SUCCESS] All SmartHealth collections successfully seeded into MongoDB Atlas!\n")
    return True

if __name__ == "__main__":
    seed_database()

