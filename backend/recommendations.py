from typing import Dict, Any, List
from models import TelemetryPayload, ZoneEvaluation

def evaluate_vitals_zone(telemetry: TelemetryPayload) -> ZoneEvaluation:
    """
    Evaluates IoT telemetry across the 3 clinical zones with sensor validation:
    - RED (Critical): Immediate danger, severe arrhythmia, critical fever, hypoxia (<90%), or Confirmed Fall.
    - YELLOW (Average/Warning): Moderate deviation (mild fever, tachycardia, borderline SpO2).
    - GREEN (Normal): Stable vitals within physiological reference ranges or sensor standby.
    """
    hr = telemetry.heart_rate
    spo2 = telemetry.spo2
    temp_c = telemetry.temperature_c
    impact = telemetry.impact_detected
    accel = telemetry.acceleration_g
    ir = telemetry.ir_value

    # Finger placement check on MAX30102
    # If ir_value is provided and < 50000, finger is lifted/not placed
    finger_on = getattr(telemetry, 'finger_detected', True)
    if ir > 0 and ir < 50000:
        finger_on = False

    # Check for Critical Zone (RED)
    critical_triggers = []
    
    # 1. Fall Impact Confirmation (Threshold 2.8g with debounced flag)
    if impact or accel >= 2.8:
        critical_triggers.append(f"FALL DETECTED! High impact force registered ({accel:.2f}g)")
        
    # 2. Heart Rate Check (Only evaluate if finger is steadily placed on sensor)
    if finger_on and hr > 0:
        if hr > 130:
            critical_triggers.append(f"Severe Tachycardia: Heart rate critically high ({hr:.1f} BPM)")
        elif hr < 45 and hr >= 30:
            critical_triggers.append(f"Severe Bradycardia: Heart rate critically low ({hr:.1f} BPM)")
        
    # 3. Oxygen Saturation Check (Only evaluate if valid optical reading between 70% and 89%)
    if finger_on and 70 <= spo2 < 90:
        critical_triggers.append(f"Critical Hypoxemia: SpO2 dangerously low ({spo2:.1f}%)")
        
    # 4. Body Temperature Check (Filter out sensor disconnect -127°C or 0°C readings)
    if 30.0 <= temp_c <= 44.0:
        if temp_c >= 39.5:
            critical_triggers.append(f"Hyperpyrexia: High critical fever ({temp_c:.1f}°C / {temp_c*9/5+32:.1f}°F)")
        elif temp_c < 35.0:
            critical_triggers.append(f"Hypothermia: Body temperature dangerously low ({temp_c:.1f}°C)")

    if critical_triggers:
        return ZoneEvaluation(
            zone="RED",
            zone_label="CRITICAL EMERGENCY",
            status_code=2,
            severity_level="High Risk",
            summary_message="CRITICAL SITUATION DETECTED: Immediate medical intervention required!",
            symptoms_detected=critical_triggers,
            recommendations=[
                "🚨 DO NOT PANIC. Keep the patient in a safe recovery posture.",
                "🚨 Emergency services (Ambulance 112) dialer has been activated.",
                "🚨 GPS coordinates broadcasted to registered emergency contacts.",
                "🚨 If patient is conscious, loosen tight clothing and ensure free airway.",
                "🚨 Keep emergency medication (e.g. Sorbitrate/Inhaler if prescribed) within reach."
            ],
            medicine_advice=[
                {
                    "name": "Immediate Medical Support",
                    "dosage": "Emergency Care",
                    "reason": "Vitals are out of safe physiological threshold. Self-medication is unsafe.",
                    "action": "Await paramedic team or proceed to nearest emergency triage."
                }
            ],
            dietary_tips=[
                "Do not administer solid foods or fluids if patient is dizzy or prone to choking.",
                "Keep patient comfortable and warm."
            ],
            doctor_action_needed=True,
            fall_alert_active=(impact or accel >= 2.8),
            emergency_call_required=True,
            suggested_emergency_number="112"
        )

    # Check for Average / Warning Zone (YELLOW)
    warning_triggers = []
    warning_recommendations = []
    warning_medicines = []
    warning_dietary = []

    # 1. Temperature Check (Fever / Sub-febrile within physiological bounds)
    if 37.3 <= temp_c <= 39.4:
        warning_triggers.append(f"Mild to Moderate Fever detected ({temp_c:.1f}°C / {temp_c*9/5+32:.1f}°F)")
        warning_recommendations.append("Rest in a well-ventilated, moderately cool room (22°C - 24°C).")
        warning_recommendations.append("Apply a damp lukewarm cloth / cold compress on forehead, wrists, and neck.")
        warning_recommendations.append("Monitor body temperature every 30 minutes via the IoT sensor.")
        
        warning_medicines.append({
            "name": "Paracetamol (Acetaminophen) 500mg or 650mg",
            "dosage": "1 tablet every 6 to 8 hours after food (Max 3g/day for adults)",
            "purpose": "Antipyretic for reducing fever and easing body aches",
            "caution": "Avoid if having known severe liver dysfunction. Do not take multiple paracetamol-containing products."
        })
        warning_dietary.append("Drink plenty of oral rehydration fluids, tender coconut water, or warm clear soups to replace electrolytes.")

    # 2. Heart Rate Check (Only when finger is securely placed)
    if finger_on and hr > 0:
        if 101 <= hr <= 130:
            warning_triggers.append(f"Elevated Resting Heart Rate / Mild Tachycardia ({hr:.1f} BPM)")
            warning_recommendations.append("Sit down immediately in a comfortable upright chair with back support.")
            warning_recommendations.append("Perform 4-7-8 Breathing: Inhale through nose for 4s, hold 7s, exhale slowly through mouth for 8s.")
            warning_recommendations.append("Avoid physical exertion, sudden movements, or climbing stairs.")
            
            warning_medicines.append({
                "name": "Electrolyte ORS Solution / Hydration Therapy",
                "dosage": "200ml - 300ml sipped slowly",
                "purpose": "Corrects sub-clinical dehydration which is the #1 trigger of resting tachycardia",
                "caution": "If you are on prescribed beta-blockers (e.g., Metoprolol), verify if your scheduled dose was taken. Do not take extra doses without doctor consultation."
            })
            warning_dietary.append("Strictly avoid caffeine (coffee, strong tea, energy drinks), nicotine, and high-sodium salty snacks.")

        elif 45 <= hr < 60:
            warning_triggers.append(f"Low Resting Heart Rate / Mild Bradycardia ({hr:.1f} BPM)")
            warning_recommendations.append("Keep patient warm and check if experiencing dizziness or lightheadedness.")
            warning_recommendations.append("If patient is an athlete, this may be benign. Otherwise, sit and rest.")
            warning_dietary.append("Consume a warm beverage like herbal tea or warm water.")

    # 3. SpO2 Check (Only when finger is securely placed)
    if finger_on and 90 <= spo2 <= 94:
        warning_triggers.append(f"Borderline Oxygen Saturation ({spo2:.1f}%)")
        warning_recommendations.append("Change posture to an upright fowler's position or prone position (lying on stomach with chest supported).")
        warning_recommendations.append("Open windows to ensure fresh airflow in the room.")
        warning_recommendations.append("Ensure finger is warm and clean on the MAX30102 sensor.")
        warning_medicines.append({
            "name": "Steam Inhalation / Saline Nasal Spray",
            "dosage": "5-10 minutes steam inhalation",
            "purpose": "Clears upper airway congestion and improves nasal breathing",
            "caution": "If SpO2 does not recover above 94% within 15 minutes or patient feels breathless, call doctor."
        })
        warning_dietary.append("Stay hydrated with warm water. Avoid heavy meals that press against the diaphragm.")

    if warning_triggers:
        return ZoneEvaluation(
            zone="YELLOW",
            zone_label="AVERAGE / MODERATE WARNING",
            status_code=1,
            severity_level="Moderate Attention",
            summary_message="AVERAGE HEALTH STATUS: Vitals show slight physiological strain. Follow the care recommendations and suggested medicine below.",
            symptoms_detected=warning_triggers,
            recommendations=warning_recommendations,
            medicine_advice=warning_medicines,
            dietary_tips=warning_dietary,
            doctor_action_needed=False,
            fall_alert_active=False,
            emergency_call_required=False,
            suggested_emergency_number=""
        )

    # Normal Zone (GREEN)
    status_msg = "All vitals (Heart Rate, SpO2, Body Temp, Movement) are in the healthy target range."
    if not finger_on and ir > 0:
        status_msg = "MAX30102 Sensor Standby: Place finger steadily on optical sensor to read pulse & SpO2."

    return ZoneEvaluation(
        zone="GREEN",
        zone_label="NORMAL & HEALTHY",
        status_code=0,
        severity_level="Optimal",
        summary_message=status_msg,
        symptoms_detected=["All parameters stable"],
        recommendations=[
            "Excellent vitals! Maintain your current routine.",
            "Aim for 2.5 Liters of water daily.",
            "Take a short 10-minute walk or gentle stretching to maintain circulation.",
            "Ensure 7-8 hours of quality sleep tonight."
        ],
        medicine_advice=[
            {
                "name": "No Acute Medication Needed",
                "dosage": "N/A",
                "purpose": "Routine health maintenance",
                "caution": "Continue taking your doctor-prescribed chronic maintenance medicines (e.g. daily vitamins/BP/sugar) on schedule."
            }
        ],
        dietary_tips=[
            "Consume antioxidant-rich fresh fruits, leafy greens, and balanced proteins.",
            "Maintain moderate sodium intake."
        ],
        doctor_action_needed=False,
        fall_alert_active=False,
        emergency_call_required=False,
        suggested_emergency_number=""
    )
