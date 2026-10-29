from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TelemetryPayload(BaseModel):
    device_id: str = "ESP32-PATIENT-01"
    heart_rate: float = Field(default=75.0, description="Heart rate in BPM from MAX30102")
    spo2: float = Field(default=98.0, description="SpO2 percentage estimate")
    ir_value: int = Field(default=65000, description="Raw IR reading")
    red_value: int = Field(default=62000, description="Raw Red reading")
    temperature_c: float = Field(default=36.8, description="DS18B20 body temperature in Celsius")
    temperature_f: Optional[float] = None
    ax: float = Field(default=0.02, description="MPU6050 Accel X in g")
    ay: float = Field(default=-0.04, description="MPU6050 Accel Y in g")
    az: float = Field(default=0.99, description="MPU6050 Accel Z in g")
    acceleration_g: float = Field(default=0.99, description="Total magnitude in g")
    impact_detected: bool = Field(default=False, description="Fall impact detected if > 2.5g")
    latitude: float = Field(default=28.6139, description="GPS Latitude")
    longitude: float = Field(default=77.2090, description="GPS Longitude")
    satellites: int = Field(default=6, description="GPS Satellite count")
    gps_valid: bool = Field(default=True, description="GPS Fix Valid")
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

class SOSIncident(BaseModel):
    incident_id: Optional[str] = None
    device_id: str = "ESP32-PATIENT-01"
    patient_name: str = "Rajesh Sharma"
    patient_age: int = 58
    trigger_type: str = "FALL_DETECTION"  # or "MANUAL_PANIC_BUTTON"
    heart_rate: float = 85.0
    spo2: float = 97.0
    temperature_c: float = 36.8
    acceleration_g: float = 3.2
    latitude: float = 28.6139
    longitude: float = 77.2090
    maps_url: str = "https://maps.google.com/?q=28.6139,77.2090"
    status: str = "TRIGGERED"  # "TRIGGERED", "CANCELLED_BY_USER", "DISPATCHED"
    dial_number: str = "112"
    timestamp: Optional[str] = None

class EmergencyContact(BaseModel):
    id: Optional[str] = None
    name: str
    relationship: str
    phone: str
    is_primary: bool = False
    notify_sms: bool = True
    notify_call: bool = True

class MedicineSchedule(BaseModel):
    id: Optional[str] = None
    name: str
    dosage: str
    frequency: str
    timing: str  # e.g. "08:00 AM", "01:00 PM", "08:00 PM"
    meal_relation: str  # "Before Meal", "After Meal"
    purpose: str
    taken_today: bool = False
    stock_count: int = 20

class DoctorAppointment(BaseModel):
    id: Optional[str] = None
    doctor_name: str
    specialty: str
    hospital: str
    date: str
    time: str
    mode: str = "In-Clinic"  # "In-Clinic" or "Teleconsultation"
    status: str = "Confirmed"
    consultation_notes: Optional[str] = ""

class LabReport(BaseModel):
    id: Optional[str] = None
    test_name: str
    date: str
    result_value: str
    reference_range: str
    status: str  # "Normal", "Borderline", "High", "Low"
    category: str

class SymptomQuery(BaseModel):
    symptom_text: str
    current_heart_rate: Optional[float] = None
    current_temp: Optional[float] = None
    current_spo2: Optional[float] = None
    duration_hours: Optional[int] = 12
