"""
SmartHealth AI Medical Knowledge & Prescription Engine
Provides accurate clinical triage, medicine prescription for illnesses, dosage instructions, and health suggestions.
"""

from typing import Dict, Any, List

# Comprehensive Disease & Symptom Knowledge Base
DISEASE_KNOWLEDGE_BASE = {
    "fever": {
        "condition": "Acute Febrile Illness / Pyrexia",
        "medicines": [
            {
                "name": "Paracetamol (Dolo 650 / Calpol 650)",
                "composition": "Acetaminophen 650mg",
                "dosage": "1 tablet every 6 to 8 hours after food",
                "duration": "2 - 3 days as needed (Max 3 tabs/day for adults)",
                "purpose": "Antipyretic to bring down body temperature and relieve generalized body ache.",
                "caution": "Do not take on empty stomach. Avoid combining with other paracetamol products. Liver caution."
            },
            {
                "name": "ORS (Oral Rehydration Salts)",
                "composition": "WHO formula electrolytes (Sodium, Potassium, Glucose)",
                "dosage": "1 sachet in 1 liter clean drinking water, sip throughout the day",
                "duration": "Continue while febrile",
                "purpose": "Prevents dehydration and resting heart rate spikes caused by body heat.",
                "caution": "Use within 24 hours of preparation."
            }
        ],
        "home_remedies": [
            "Lukewarm water sponging / cold damp cloth on forehead, neck, and armpits.",
            "Rest in a cool, well-ventilated room (22°C - 24°C) with light cotton clothing.",
            "Consume light khichdi, moong dal soup, or tender coconut water."
        ],
        "red_flags": "If fever exceeds 39.5°C (103°F), persists beyond 72 hours, or is accompanied by stiff neck or shortness of breath, visit an emergency clinic immediately."
    },
    "cough": {
        "condition": "Acute Bronchial / Upper Respiratory Cough",
        "medicines": [
            {
                "name": "Ascoril-LS / Grilinctus (For Wet/Phlegm Cough) OR Benadryl-DR (For Dry Cough)",
                "composition": "Levosalbutamol + Ambroxol + Guaiphenesin (Wet) OR Dextromethorphan (Dry)",
                "dosage": "5ml to 10ml twice or thrice daily after food",
                "duration": "4 - 5 days",
                "purpose": "Expels phlegm and thins bronchial secretions; calms irritated dry throat reflexes.",
                "caution": "May cause mild drowsiness. Avoid driving. Take with warm water."
            },
            {
                "name": "Warm Saltwater Gargle / Betadine 2% Gargle",
                "composition": "Saline / Povidone Iodine 2%",
                "dosage": "Gargle 30 seconds with 100ml warm water, 3 times a day",
                "duration": "3 - 5 days",
                "purpose": "Reduces localized oropharyngeal inflammation and viral bacterial load.",
                "caution": "Do not swallow."
            }
        ],
        "home_remedies": [
            "Steam inhalation with 2-3 drops of eucalyptus oil for 5 to 8 minutes.",
            "1 teaspoon of warm natural honey mixed with crushed ginger juice and black pepper.",
            "Strictly avoid ice-cold drinks, oily deep-fried foods, and exposure to cold air."
        ],
        "red_flags": "Cough lasting > 2 weeks, coughing blood (hemoptysis), high wheezing, or difficulty breathing."
    },
    "cold": {
        "condition": "Acute Viral Rhinitis / Common Cold",
        "medicines": [
            {
                "name": "Cetirizine 10mg / Levocetirizine 5mg (Okacet / Montair-LC)",
                "composition": "Cetirizine Hydrochloride / Levocetirizine + Montelukast",
                "dosage": "1 tablet at bedtime with water",
                "duration": "3 - 5 days",
                "purpose": "Stops continuous sneezing, watery nasal discharge, and itchy eyes.",
                "caution": "Causes mild sedation; best taken before sleeping."
            },
            {
                "name": "Otrivin / Nasivion Adult Nasal Spray",
                "composition": "Xylometazoline 0.1%",
                "dosage": "1 spray in each nostril twice daily",
                "duration": "Strictly maximum 3 to 4 days (to avoid rebound congestion)",
                "purpose": "Instant decongestion of blocked nasal passages.",
                "caution": "Do not use for more than 5 consecutive days."
            }
        ],
        "home_remedies": [
            "Drink hot herbal ginger-tulsi-clove tea or warm turmeric milk.",
            "Perform steam inhalation twice daily.",
            "Keep head slightly elevated during sleep to facilitate nasal drainage."
        ],
        "red_flags": "Severe facial sinus pain, earache, or fever above 38.5°C."
    },
    "acidity": {
        "condition": "Gastroesophageal Reflux Disease (GERD) / Dyspepsia",
        "medicines": [
            {
                "name": "Pan-D / Pantocid DSR / Omez-D",
                "composition": "Pantoprazole 40mg + Domperidone 30mg",
                "dosage": "1 capsule in the morning on an empty stomach",
                "duration": "5 - 7 days",
                "purpose": "Suppresses excess gastric acid secretion and prevents nausea/reflux.",
                "caution": "Take 30 to 45 minutes BEFORE breakfast with plain water. Do not crush."
            },
            {
                "name": "Digene / Gelusil Liquid Antacid",
                "composition": "Magnesium Hydroxide + Aluminium Hydroxide + Simethicone",
                "dosage": "10ml - 15ml as an SOS relief after meals or when burning occurs",
                "duration": "As needed",
                "purpose": "Quickly neutralizes stomach acid and soothes the esophagus.",
                "caution": "Shake well before using."
            }
        ],
        "home_remedies": [
            "Drink cold skimmed milk or tender coconut water.",
            "Chew on fennel seeds (saunf) after meals.",
            "Avoid lying down immediately after eating; keep 2 hours gap between dinner and sleep.",
            "Avoid spicy red chili, coffee, carbonated sodas, and citrus juices."
        ],
        "red_flags": "Burning pain radiating to left arm or jaw (mimics cardiac ischemia - rule out heart attack!), difficulty swallowing, or vomiting blood."
    },
    "headache": {
        "condition": "Tension Headache / Dehydration Headache",
        "medicines": [
            {
                "name": "Paracetamol 500mg or Ibuprofen 400mg (Brufen)",
                "composition": "Acetaminophen 500mg OR Ibuprofen 400mg",
                "dosage": "1 tablet with a full glass of water after food",
                "duration": "SOS single dose, repeat after 8 hours only if needed",
                "purpose": "Relieves vascular tension and cranial pain.",
                "caution": "Never take NSAIDs (Ibuprofen) on an empty stomach. Avoid in gastric ulcers."
            }
        ],
        "home_remedies": [
            "Immediately drink 500ml of water and rest in a dark, quiet room.",
            "Apply a cold damp washcloth or ice pack on the forehead and temples.",
            "Gentle neck and shoulder massage to release muscular contractions."
        ],
        "red_flags": "Sudden onset 'worst headache of life' (thunderclap), headache with blurred vision, fever, or confusion."
    },
    "hypertension": {
        "condition": "Essential Hypertension / Elevated Blood Pressure",
        "medicines": [
            {
                "name": "Telmisartan 40mg (Telma 40) OR Amlodipine 5mg",
                "composition": "Angiotensin II Receptor Blocker / Calcium Channel Blocker",
                "dosage": "As strictly prescribed by your cardiologist (typically 1 tab once daily in morning)",
                "duration": "Long-term maintenance",
                "purpose": "Relaxes vascular smooth muscle and lowers systemic peripheral resistance.",
                "caution": "Prescription mandatory. Never miss or abruptly halt blood pressure medications."
            }
        ],
        "home_remedies": [
            "DASH Diet: Strictly restrict table salt to less than 3 grams/day. Avoid pickles and papad.",
            "Engage in 30 minutes of brisk daily walking.",
            "Perform 4-7-8 deep diaphragmatic breathing to lower sympathetic surge."
        ],
        "red_flags": "Systolic BP > 180 or Diastolic > 110, chest tightness, vision blackouts, or shortness of breath."
    },
    "diabetes": {
        "condition": "Type-2 Diabetes Mellitus / Hyperglycemia",
        "medicines": [
            {
                "name": "Metformin 500mg (Glycomet)",
                "composition": "Biguanide 500mg Extended Release",
                "dosage": "1 tablet twice daily with breakfast and dinner",
                "duration": "Long-term glycemic management",
                "purpose": "Improves insulin sensitivity and reduces hepatic glucose production.",
                "caution": "Take with meals. Check kidney function test (serum creatinine) annually."
            }
        ],
        "home_remedies": [
            "Low glycemic index diet: replace white rice and refined flour with millets, oats, and green leafy vegetables.",
            "1 glass of bitter gourd (karela) juice or soaked fenugreek (methi) water in the morning.",
            "Monitor fasting and post-prandial blood glucose weekly."
        ],
        "red_flags": "Fasting blood sugar > 250 mg/dL, fruity breath, extreme thirst, deep rapid breathing (diabetic ketoacidosis)."
    },
    "diarrhea": {
        "condition": "Acute Gastroenteritis / Loose Stools",
        "medicines": [
            {
                "name": "ORS (Oral Rehydration Solution) + Zinc 20mg",
                "composition": "Electrolytes + Zinc Gluconate",
                "dosage": "Drink 200ml after every loose stool + 1 Zinc tab daily",
                "duration": "3 - 5 days",
                "purpose": "Replenishes vital lost minerals and restores gut mucosal lining.",
                "caution": "Keep sipping continuously."
            },
            {
                "name": "Econorm / Darolac Capsule (Probiotic)",
                "composition": "Saccharomyces boulardii / Lactobacillus",
                "dosage": "1 capsule twice daily with water",
                "duration": "5 days",
                "purpose": "Restores healthy gut flora and curtails pathogen colonization.",
                "caution": "Do not mix with hot liquids."
            }
        ],
        "home_remedies": [
            "BRAT Diet: Bananas, Rice khichdi, Applesauce, and Toast with curd (dahi).",
            "Pomegranate juice and coconut water.",
            "Avoid dairy milk, fatty foods, caffeine, and raw salads until stools normalize."
        ],
        "red_flags": "Blood in stool, high fever, sunken eyes, inability to retain oral fluids, or signs of severe dehydration."
    },
    "body_pain": {
        "condition": "Musculoskeletal Pain / Arthralgia / Myalgia",
        "medicines": [
            {
                "name": "Aceclofenac 100mg + Paracetamol 325mg (Zerodol-P)",
                "composition": "NSAID + Analgesic",
                "dosage": "1 tablet twice daily strictly after meals",
                "duration": "3 days only",
                "purpose": "Relieves joint swelling, muscular spasm, and inflammatory body ache.",
                "caution": "Always take after food. Drink plenty of water. Contraindicated in kidney disease."
            },
            {
                "name": "Volini / Moov Gel",
                "composition": "Diclofenac Diethylamine + Methyl Salicylate + Menthol",
                "dosage": "Apply gently over painful area 3 times daily",
                "duration": "As needed",
                "purpose": "Topical analgesic for localized relief.",
                "caution": "Do not apply on broken or cut skin."
            }
        ],
        "home_remedies": [
            "Hot water bag or heating pad compression for 15-20 minutes.",
            "Drink warm turmeric milk (golden milk) before sleep for natural anti-inflammatory benefits.",
            "Gentle stretching and avoidance of heavy lifting."
        ],
        "red_flags": "Joint red, warm, severely swollen with fever, or inability to bear weight."
    }
}

def analyze_and_prescribe(query_text: str, vitals: Dict[str, Any] = None) -> Dict[str, Any]:
    text = query_text.lower().strip()
    vitals = vitals or {}
    hr = vitals.get("heart_rate", 75)
    temp = vitals.get("temperature_c", 36.8)
    spo2 = vitals.get("spo2", 98)

    # Detect primary disease match
    matched_condition = None
    if any(k in text for k in ["fever", "bukhar", "high temp", "garam"]):
        matched_condition = "fever"
    elif any(k in text for k in ["cough", "khansi", "phlegm", "balgam"]):
        matched_condition = "cough"
    elif any(k in text for k in ["cold", "sardi", "jukham", "runny nose", "sneezing", "chhink"]):
        matched_condition = "cold"
    elif any(k in text for k in ["acidity", "gas", "heartburn", "acid", "pet me jalan", "bloating"]):
        matched_condition = "acidity"
    elif any(k in text for k in ["headache", "sar dard", "migraine", "head pain"]):
        matched_condition = "headache"
    elif any(k in text for k in ["bp", "blood pressure", "hypertension", "tachycardia"]):
        matched_condition = "hypertension"
    elif any(k in text for k in ["sugar", "diabetes", "glucose", "madhumeh"]):
        matched_condition = "diabetes"
    elif any(k in text for k in ["diarrhea", "loose motion", "dast", "pet kharab", "stomach upset"]):
        matched_condition = "diarrhea"
    elif any(k in text for k in ["body pain", "joint pain", "badan dard", "back pain", "kamar dard", "muscle pain"]):
        matched_condition = "body_pain"

    # Emergency check (Chest pain, unconsciousness, severe breathlessness)
    if any(k in text for k in ["chest pain", "seene me dard", "heart attack", "unconscious", "choking", "breathless", "sans lene me takleef"]):
        return {
            "urgency": "🚨 CRITICAL EMERGENCY",
            "condition_diagnosed": "Acute Cardiopulmonary / Coronary Crisis",
            "clinical_assessment": "The reported symptoms indicate a potential high-risk medical emergency requiring immediate hospitalization.",
            "emergency_actions": [
                "🚨 DIAL 112 / 108 AMBULANCE IMMEDIATELY.",
                "Keep the patient sitting upright and calm. Loosen all tight clothing around neck and waist.",
                "Chew Disprin (Aspirin 300mg) soluble if not allergic and instructed by emergency medic.",
                "Do not allow patient to drive or walk."
            ],
            "prescribed_medicines": [
                {
                    "name": "Soluble Aspirin 300mg (Disprin)",
                    "composition": "Acetylsalicylic Acid 300mg",
                    "dosage": "1 tablet chewed immediately (if no known allergy)",
                    "purpose": "Anti-platelet agent to prevent coronary clot enlargement.",
                    "caution": "Emergency measure only while awaiting ambulance."
                }
            ],
            "dietary_lifestyle": ["Do not administer solid food or liquids."],
            "red_flags": "Immediate paramedic dispatch required.",
            "vitals_considered": {"heart_rate": hr, "temp_c": temp, "spo2": spo2}
        }

    if matched_condition and matched_condition in DISEASE_KNOWLEDGE_BASE:
        data = DISEASE_KNOWLEDGE_BASE[matched_condition]
        return {
            "urgency": "MODERATE / OUTPATIENT",
            "condition_diagnosed": data["condition"],
            "clinical_assessment": f"Evaluated for '{query_text}'. Real-time vitals: Heart Rate: {hr} BPM, Temp: {temp}°C, SpO2: {spo2}%.",
            "prescribed_medicines": data["medicines"],
            "dietary_lifestyle": data["home_remedies"],
            "red_flags": data["red_flags"],
            "emergency_actions": [
                "Take prescribed medications on time with proper food instructions.",
                "Monitor vitals on SmartHealth IoT monitor twice daily."
            ],
            "vitals_considered": {"heart_rate": hr, "temp_c": temp, "spo2": spo2}
        }

    # Generalized response for other queries
    return {
        "urgency": "INFORMATIONAL & WELLNESS",
        "condition_diagnosed": "General Health Query / Mild Symptoms",
        "clinical_assessment": f"Symptoms evaluated for: '{query_text}'. Vitals are currently: HR {hr} BPM, SpO2 {spo2}%, Temp {temp}°C.",
        "prescribed_medicines": [
            {
                "name": "Multivitamin & Vitamin C 500mg (Limcee / Becosules)",
                "composition": "Ascorbic Acid + B-Complex",
                "dosage": "1 tablet daily after lunch",
                "purpose": "General immunity and metabolic support.",
                "caution": "Drink plenty of water."
            }
        ],
        "dietary_lifestyle": [
            "Maintain 2.5 to 3.0 Liters of water hydration daily.",
            "Eat fresh antioxidant-rich seasonal fruits and avoid processed junk foods.",
            "Ensure 7 to 8 hours of restful sleep."
        ],
        "red_flags": "If symptoms worsen, persist for more than 48 hours, or new red-flag symptoms appear, consult an empaneled doctor.",
        "emergency_actions": ["Keep monitoring sensor vitals."],
        "vitals_considered": {"heart_rate": hr, "temp_c": temp, "spo2": spo2}
    }
