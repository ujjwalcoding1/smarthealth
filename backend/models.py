from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TelemetryPayload(BaseModel):
    device_id: str = "ESP32-HARDWARE"
    heart_rate: float = Field(default=0.0, description="Heart rate in BPM from MAX30102")
    spo2: float = Field(default=98.0, description="SpO2 percentage estimate")
    ir_value: int = Field(default=0, description="Raw IR reading")
    red_value: int = Field(default=0, description="Raw Red reading")
    temperature_c: float = Field(default=36.8, description="DS18B20 body temperature in Celsius")
    temperature_f: Optional[float] = None
    ax: float = Field(default=0.0, description="MPU6050 Accel X in g")
    ay: float = Field(default=0.0, description="MPU6050 Accel Y in g")
    az: float = Field(default=1.0, description="MPU6050 Accel Z in g")
    acceleration_g: float = Field(default=1.0, description="Total magnitude in g")
    impact_detected: bool = Field(default=False, description="Fall impact detected if > 2.5g")
    latitude: float = Field(default=28.6139, description="GPS Latitude")
    longitude: float = Field(default=77.2090, description="GPS Longitude")
    satellites: int = Field(default=0, description="GPS Satellite count")
    gps_valid: bool = Field(default=False, description="GPS Fix Valid")
    timestamp: Optional[str] = None

class ZoneEvaluation(BaseModel):
    zone: str  # "GREEN" (Normal), "YELLOW" (Average / Warning), "RED" (Critical)
    zone_label: str
    status_code: int  # 0: Green, 1: Yellow, 2: Red
    severity_level: str
    summary_message: str
    symptoms_detected: List[str] = []
    recommendations: List[str] = []
    medicine_advice: List[Dict[str, str]] = []
    dietary_tips: List[str] = []
    doctor_action_needed: bool = False
    fall_alert_active: bool = False
    emergency_call_required: bool = False
    suggested_emergency_number: str = "112"

class SOSConfig(BaseModel):
    primary_sos_number: str = "112"
    secondary_guardian_number: str = "+919811223344"
    secondary_guardian_name: str = "Family Guardian"
    ambulance_number: str = "108"
    doctor_phone: str = "+919876543210"
    doctor_name: str = "Dr. Sameer Verma"
    auto_dial_delay_seconds: int = 10
    enable_sms_alert: bool = True
    custom_message: Optional[str] = "EMERGENCY: Patient needs urgent medical attention!"

class DoctorItem(BaseModel):
    id: Optional[str] = None
    name: str
    specialty: str
    qualification: str = "MBBS, MD"
    experience_years: int = 10
    hospital_clinic_name: str
    location: str
    phone: str
    whatsapp_number: str
    email: Optional[str] = "doctor@smarthealth.org"
    consultation_fee: int = 500
    available_days: str = "Mon - Sat"
    available_time: str = "10:00 AM - 02:00 PM, 05:00 PM - 08:00 PM"
    photo_url: str = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
    rating: float = 4.9

class HospitalClinicItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: str = "Multi-Speciality Hospital"  # "Hospital", "Clinic", "Trauma Center"
    address: str
    city: str
    state: str
    pincode: str = "110001"
    emergency_phone: str
    reception_phone: str
    email: Optional[str] = "info@hospital.org"
    emergency_24x7: bool = True
    ambulance_available: bool = True
    facilities: List[str] = ["24/7 ICU", "Blood Bank", "Trauma Care", "Oxygen Supply", "Pharmacy"]
    photo_url: str = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80"
    google_maps_url: str = "https://maps.google.com/?q=28.6139,77.2090"
    rating: float = 4.8

class MedicineItem(BaseModel):
    id: Optional[str] = None
    brand_name: str
    generic_name: str
    category: str  # "Fever & Pain", "Antibiotic", "Cardiac & BP", "Diabetes", "Acidity & Digestion", "Cough & Cold", "Allergy"
    illness_treated: str
    dosage_adult: str
    frequency: str
    meal_instruction: str  # "After Meal", "Before Meal", "With Water"
    precautions: str
    side_effects: str
    prescription_required: bool = False
    price_inr: float = 50.0

class GovSchemeItem(BaseModel):
    id: Optional[str] = None
    scheme_name: str
    authority: str
    category: str
    description: str
    benefits: str
    eligibility: str
    helpline_number: str
    official_portal_url: str

class ConsultationBooking(BaseModel):
    id: Optional[str] = None
    patient_name: str
    patient_email: str
    patient_phone: str
    age: int
    gender: str = "Male"
    doctor_id: Optional[str] = None
    doctor_name: str
    hospital_name: Optional[str] = ""
    doctor_whatsapp: Optional[str] = ""
    preferred_date: str
    preferred_time: str
    consultation_mode: str = "Video Consultation"  # "In-Clinic Visit", "Video Consultation"
    symptoms_description: str
    vitals_snapshot: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class SymptomQuery(BaseModel):
    symptom_text: str
    current_heart_rate: Optional[float] = None
    current_temp: Optional[float] = None
    current_spo2: Optional[float] = None
