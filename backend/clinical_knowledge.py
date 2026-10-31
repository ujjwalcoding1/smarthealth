"""
SmartHealth Comprehensive Clinical Medical Knowledge & Dynamic Reasoning Engine
Provides factual, evidence-based clinical diagnostics, pharmacology, and dynamic inquiry synthesis.
"""

from typing import Dict, Any, List, Optional

# =========================================================================
# EXPANDED COMPREHENSIVE CLINICAL MEDICAL KNOWLEDGE BASE (40+ CONDITIONS)
# =========================================================================
EXPANDED_KNOWLEDGE = {
    "stomach_pain": {
        "keywords": ["stomach pain", "pet dard", "pet me dard", "stomach ache", "abdominal pain", "pet kharab", "gas dard", "cramps", "belly pain", "colic"],
        "condition": "Acute Abdominal Pain & Functional Gastric Spasm",
        "scientific_facts": (
            "Abdominal pain commonly arises from visceral smooth muscle hypermotility/spasm, gastric mucosal irritation, "
            "excess luminal gas entrapment, or inflammatory dysmotility. In the upper abdomen (epigastrium), common etiologies "
            "include acute gastritis, peptic ulcer disease, and non-ulcer dyspepsia. In the periumbilical region, spasm of small intestinal loops "
            "or gastroenteritis is prevalent. Normal physiological peristalsis occurs at 3-5 cycles per minute; hyperactive spasmodic contractions "
            "trigger nociceptive visceral sensory nerve activation causing cramping pain."
        ),
        "scientific_facts_hi": (
            "पेट दर्द (Abdominal Pain) आमतौर पर आंतों या आमाशय की चिकनी मांसपेशियों में अत्यधिक ऐंठन (Spasm), गैस बनने, "
            "या खान-पान में गड़बड़ी से होने वाली एसिडिटी/गैस्ट्राइटिस के कारण होता है। पेट के ऊपरी हिस्से में दर्द अक्सर एसिड रिफ्लक्स या अल्सर से जुड़ा होता है, "
            "जबकि नाभि के आसपास ऐंठन आंतों के संक्रमण या गैस की वजह से होती है।"
        ),
        "medicines": [
            {
                "name": "Dicyclomine 10mg + Mefenamic Acid 250mg (Meftal-Spas / Spasmonil)",
                "composition": "Antispasmodic + Non-Steroidal Anti-Inflammatory",
                "dosage": "1 tablet after meals (only when severe pain/spasm occurs; max 2-3 tabs/day)",
                "duration": "SOS / 1 to 2 days as needed",
                "purpose": "Relaxes smooth muscle spasm in gastrointestinal tract and inhibits inflammatory prostaglandin pain mediators.",
                "caution": "Avoid on empty stomach. Not recommended if peptic ulcer bleeding or severe kidney disease is present."
            },
            {
                "name": "Pantoprazole 40mg (Pan 40)",
                "composition": "Proton Pump Inhibitor (PPI)",
                "dosage": "1 tablet 30 minutes before breakfast with plain water",
                "duration": "3 to 5 days",
                "purpose": "Suppresses gastric parietal H+/K+ ATPase pumps, reducing hydrochloric acid secretion and soothing gastric mucosal lining.",
                "caution": "Swallow whole; do not crush or chew."
            }
        ],
        "lifestyle_diet": [
            "Light Bland Diet: Consume easy-to-digest foods such as moong dal khichdi, plain curd, boiled white rice, and clear vegetable broth.",
            "Avoid Gastric Irritants: Strictly avoid deep-fried oily snacks, chili peppers, raw onions, carbonated sodas, and strong coffee/tea.",
            "Sip Warm Water: Drink lukewarm water or peppermint/fennel (saunf) infused water to relax visceral intestinal smooth muscles.",
            "Apply Mild Warmth: A warm water heating pad placed on the lower abdomen eases paroxysmal visceral cramping."
        ],
        "red_flags": "Sudden severe rigid abdomen ('board-like' hardness), persistent vomiting with blood, high fever with localized right lower quadrant pain (possible appendicitis), or black tarry stools requires emergency surgical evaluation immediately."
    },

    "diarrhea_loose_motion": {
        "keywords": ["diarrhea", "loose motion", "dast", "loose motions", "watery stool", "food poisoning", "dast lagna", "pet kharab ulti"],
        "condition": "Acute Diarrheal Illness & Enteric Gastrointestinal Dehydration",
        "scientific_facts": (
            "Acute diarrhea (passage of ≥ 3 loose or watery stools within 24 hours) results from impaired enterocyte fluid absorption "
            "and hypersecretion of water and electrolytes into the intestinal lumen, most frequently triggered by viral pathogens (Rotavirus, Norovirus) "
            "or enteric bacteria (E. coli, Campylobacter, Salmonella) from contaminated food or water. The primary physiological danger of diarrhea "
            "is intravascular hypovolemia, metabolic acidosis, and hypokalemia (potassium loss)."
        ),
        "scientific_facts_hi": (
            "दस्त (Diarrhea / Loose Motions) आंतों में बैक्टीरिया या वायरस के संक्रमण से होता है, जिससे शरीर से पानी, सोडियम और पोटेशियम की भारी हानि होती है। "
            "दस्त का सबसे बड़ा खतरा निर्जलीकरण (Dehydration) और कमजोरी है। समय पर ओआरएस घोल लेना सबसे महत्वपूर्ण जीवनरक्षक उपाय है।"
        ),
        "medicines": [
            {
                "name": "WHO Oral Rehydration Salts (Electral / ORS Sachet)",
                "composition": "Sodium Chloride 2.6g + Potassium Chloride 1.5g + Sodium Citrate 2.9g + Glucose 13.5g",
                "dosage": "Dissolve 1 entire sachet in 1 liter clean drinking water; sip 200-300ml after every loose stool",
                "duration": "Continue until loose stools completely cease",
                "purpose": "Utilizes intestinal sodium-glucose co-transporters to rapidly reabsorb water and electrolytes into the bloodstream.",
                "caution": "Do not boil mixed solution. Discard leftover solution after 24 hours."
            },
            {
                "name": "Zinc Sulfate 20mg (Zinconia)",
                "composition": "Elemental Zinc 20mg",
                "dosage": "1 tablet once daily with meals",
                "duration": "14 consecutive days",
                "purpose": "Accelerates intestinal epithelial regeneration and mucosal brush-border enzyme repair, reducing duration and severity.",
                "caution": "Take with food to avoid minor gastric nausea."
            },
            {
                "name": "Rifaximin 400mg (Rifagut 400) OR Ofloxacin + Ornidazole (O2)",
                "composition": "Non-absorbable Gut-Targeted Antibacterial / Antiprotozoal",
                "dosage": "1 tablet twice daily after meals (if prescribed by physician for bacterial diarrhea)",
                "duration": "3 days",
                "purpose": "Eradicates enteric bacterial pathogens in intestinal lumen without systemic side effects.",
                "caution": "Prescription mandatory. Do not take casually for mild viral diarrhea."
            }
        ],
        "lifestyle_diet": [
            "BRAT Diet: Follow Bananas (replenishes potassium), Rice (binding carbohydrate), Applesauce (pectin fiber), and Toast.",
            "Replenish Probiotics: Consume fresh unsweetened curd/buttermilk (chaas) with roasted cumin powder to restore beneficial gut flora (Lactobacillus).",
            "Continuous Hydration: Never fast on fluids; drink coconut water, rice water (kanji), and ORS constantly throughout the day.",
            "Strict Hygiene: Thoroughly wash hands with soap before eating and drink only boiled or filtered water."
        ],
        "red_flags": "Sunken eyes, extreme lethargy, inability to retain fluids, high fever (> 38.5°C), or presence of visible red blood/mucus in stool (dysentery) requires emergency clinical hospitalization."
    },

    "constipation": {
        "keywords": ["constipation", "kabz", "stool hard", "motion clear nahi", "pet saaf", "bowel", "potty nahi aati", "qabz", "straining"],
        "condition": "Chronic Functional Constipation & Colonic Dysmotility",
        "scientific_facts": (
            "Constipation is characterized by infrequent bowel movements (< 3 evacuations per week), excessive straining, hard lumpy stools (Bristol Stool Scale Type 1-2), "
            "and a sensation of incomplete anorectal evacuation. Pathophysiology involves prolonged colonic transit time, leading to excessive mucosal water reabsorption, "
            "compounded by insufficient dietary soluble/insoluble fiber (< 25-30g/day) and suboptimal daily fluid intake."
        ),
        "scientific_facts_hi": (
            "कब्ज (Constipation) में मल कठोर हो जाता है और पेट साफ नहीं होता। आंतों में भोजन की गति धीमी होने से बड़ी आंत मल से अधिक पानी सोख लेती है। "
            "कम पानी पीना, फाइबर (रेशेदार भोजन) की कमी और शारीरिक निष्क्रियता इसके मुख्य कारण हैं।"
        ),
        "medicines": [
            {
                "name": "Psyllium Husk / Isabgol (Fybogel / Naturelle)",
                "composition": "Plantago ovata seed husk (Soluble Fiber Bulk Former)",
                "dosage": "1 to 2 tablespoons (5-10g) mixed in a full glass of warm water or milk at bedtime",
                "duration": "Daily maintenance until bowel regularity is established",
                "purpose": "Absorbs water in colon, swelling into a gelatinous emollient mass that increases stool volume and stimulates natural peristalsis.",
                "caution": "Must drink a full additional glass of water immediately after consuming to prevent esophageal or intestinal impaction."
            },
            {
                "name": "Lactulose Solution 10g/15ml (Duphalac Syrup)",
                "composition": "Synthetic Non-Absorbable Disaccharide (Osmotic Laxative)",
                "dosage": "15ml to 30ml once at bedtime with half a glass of warm water (if Isabgol alone is insufficient)",
                "duration": "3 to 5 days short term",
                "purpose": "Draws water into colon via osmotic gradient and gets fermented by colonic bacteria into short-chain fatty acids, softening hard stool.",
                "caution": "Safe for long term; may cause transient mild bloating during first 48 hours."
            }
        ],
        "lifestyle_diet": [
            "High Fiber Intake (30g/day): Eat whole oats, unpolished brown rice, papaya, guavas, apples with peel, flaxseeds, and leafy green vegetables.",
            "Water Hydration: Drink 3.0 Liters of water daily. Start the morning with 2 glasses of warm water on an empty stomach to trigger the gastrocolic reflex.",
            "Morning Evacuation Routine: Dedicate 10 minutes after morning tea/breakfast to sit on the toilet without straining; use a footstool to elevate knees (Squatty Potty angle).",
            "Daily Brisk Walking: 30 minutes of physical aerobic walking stimulates colonic smooth muscle motility."
        ],
        "red_flags": "Sudden onset severe abdominal distension with vomiting and inability to pass gas (fecal impaction / bowel obstruction), unexplained weight loss, or rectal bleeding requires urgent colonoscopy/surgical review."
    },

    "vomiting_nausea": {
        "keywords": ["vomiting", "ulti", "nausea", "jee michlana", "vomit", "motion sickness", "ulti aana", "nauseous"],
        "condition": "Acute Emesis & Upper Gastrointestinal Irritation",
        "scientific_facts": (
            "Vomiting is an autonomic reflex mediated by the emetic center and chemoreceptor trigger zone (CTZ) located in the area postrema of the medulla oblongata. "
            "Dopaminergic (D2), Serotonergic (5-HT3), and Histaminergic (H1) receptors stimulate retrograde giant contractions of the small intestine, "
            "relaxation of lower esophageal sphincter, and forceful diaphragmatic and abdominal wall contractions. Common triggers include viral gastroenteritis, "
            "food toxin ingestion, vestibular motion stimulation, and gastric hyperacidity."
        ),
        "scientific_facts_hi": (
            "उल्टी और जी मिचलाना (Vomiting & Nausea) मस्तिष्क के वोमिटिंग सेंटर के उत्तेजित होने से होता है। "
            "खराब भोजन, बदहजमी, मोशन सिकनेस (यात्रा में चक्कर) या पेट में इन्फेक्शन इसके मुख्य कारण हैं। उल्टी होने पर शरीर में पानी और नमक की कमी न होने देना जरूरी है।"
        ),
        "medicines": [
            {
                "name": "Ondansetron 4mg (Emeset 4 / Vomikind MD)",
                "composition": "Selective 5-HT3 Serotonin Receptor Antagonist",
                "dosage": "1 mouth-dissolving tablet placed on tongue 30 minutes before meals or SOS when nausea strikes (Max 3 tabs/day)",
                "duration": "1 to 2 days as needed",
                "purpose": "Blocks peripheral vagal nerve 5-HT3 receptors and central CTZ receptors, rapidly aborting nausea and emetic impulses.",
                "caution": "Do not exceed recommended dose. May cause mild transient headache or constipation."
            },
            {
                "name": "Domperidone 10mg + Pantoprazole 40mg (Pan-D)",
                "composition": "D2 Receptor Prokinetic + Proton Pump Inhibitor",
                "dosage": "1 capsule 30 minutes before morning breakfast with plain water",
                "duration": "3 to 5 days",
                "purpose": "Increases lower esophageal sphincter tone and accelerates gastric emptying, preventing retrograde reflux.",
                "caution": "Take strictly on an empty stomach."
            }
        ],
        "lifestyle_diet": [
            "Sip Method (Not Gulp): Do not drink large volumes of water at once; take tiny sips of cold water, lemon ice cubes, or ORS every 5 minutes.",
            "Fresh Ginger & Mint: Chew a tiny slice of fresh ginger with black salt or sip fresh ginger-mint tea (gingerols suppress gastric tachygastria).",
            "Bland Dry Carbs: Eat dry toast, saltine crackers, or plain roasted murmura (puffed rice) to absorb excess gastric secretions.",
            "Rest with Head Elevated: Lie down with your head and torso elevated at 30 degrees; avoid lying flat immediately after eating."
        ],
        "red_flags": "Inability to keep liquids down for > 24 hours, presence of bright red blood or dark 'coffee-ground' material in vomit, severe stiff neck with high fever, or intense localized abdominal pain requires emergency hospital care."
    },

    "skin_allergy_itching": {
        "keywords": ["allergy", "khujli", "itching", "rash", "urticaria", "pitti", "skin infection", "daane", "pruritus", "eczema", "hives"],
        "condition": "Acute Urticaria, Pruritus & Allergic Dermatitis",
        "scientific_facts": (
            "Cutaneous allergic reactions and urticarial wheals occur when allergen exposure triggers IgE cross-linking on tissue mast cells and basophils, "
            "causing rapid degranulation and release of histamine, prostaglandin D2, and leukotrienes. Histamine binds H1 receptors on vascular endothelial cells, "
            "inducing local vasodilation, increased capillary permeability, localized edema (wheal), and sensory C-nerve stimulation manifesting as intense pruritus (itching)."
        ),
        "scientific_facts_hi": (
            "त्वचा पर खुजली, लाल चकत्ते या पित्ती (Allergy & Urticaria) शरीर में हिस्टामिन नामक रसायन रिलीज होने से होते हैं। "
            "धूल, मौसम बदलाव, कुछ दवाओं, साबुन या खाद्य पदार्थों से एलर्जी हो सकती है। एंटीहिस्टामिन दवाएं खुजली और सूजन को शांत करती हैं।"
        ),
        "medicines": [
            {
                "name": "Levocetirizine 5mg (Levocet / 1-AL) OR Bilastine 20mg",
                "composition": "Second-Generation Non-Sedating H1-Receptor Antagonist",
                "dosage": "1 tablet once daily at night after dinner with water",
                "duration": "3 to 5 days",
                "purpose": "Selectively blocks peripheral H1 receptors, stopping vascular leakage, wheal formation, and burning itching.",
                "caution": "Minimal drowsiness; avoid alcohol while on therapy. Safe and non-sedating."
            },
            {
                "name": "Calamine + Zinc Oxide Lotion (Caladryl)",
                "composition": "Topical Astringent & Soothing Antipruritic Agent",
                "dosage": "Apply a thin layer gently over itchy rash areas 2 to 3 times daily",
                "duration": "Until skin irritation resolves",
                "purpose": "Evaporates producing a cooling sensation that suppresses cutaneous nerve endings; zinc oxide provides mild anti-inflammatory barrier.",
                "caution": "For external application only; do not apply on open broken skin or weeping wounds."
            }
        ],
        "lifestyle_diet": [
            "Cool Compresses: Apply a cold damp washcloth or ice pack wrapped in a towel over itchy areas for 10 minutes to constrict cutaneous capillaries.",
            "Avoid Hot Showers: Bathe with lukewarm water and mild fragrance-free glycerin soap; hot water strips skin barrier lipids and triggers mast cell histamine release.",
            "Wear Loose Cotton: Wear breathable, loose, 100% cotton clothing; avoid synthetic polyester or wool fabrics that cause friction.",
            "Avoid Allergen Triggers: Eliminate suspected trigger foods (shellfish, peanuts, artificial food dyes) and avoid chemical detergents."
        ],
        "red_flags": "Swelling of lips, tongue, uvula, or throat (angioedema), difficulty breathing or wheezing, or sudden dizziness/fainting indicates systemic anaphylaxis and requires IMMEDIATE emergency intramuscular Epinephrine and ICU care."
    },

    "eye_strain_conjunctivitis": {
        "keywords": ["eye pain", "aankh dard", "eye strain", "conjunctivitis", "aankh aana", "red eyes", "aankh lal", "blurry eyes", "dry eyes", "computer vision"],
        "condition": "Digital Asthenopia (Eye Strain), Evaporative Dry Eye & Conjunctivitis",
        "scientific_facts": (
            "Digital asthenopia stems from sustained ciliary muscle tonic spasm during prolonged close-distance visual display viewing, "
            "coupled with a 60% reduction in spontaneous blink rate (from normal 15-20 blinks/min down to 5-7 blinks/min), causing rapid tear film break-up "
            "and corneal epithelial desiccation. Acute Conjunctivitis ('pink eye') involves inflammatory hyperemia of the bulbar/palpebral conjunctival microvasculature, "
            "commonly caused by Adenovirus or bacterial colonization."
        ),
        "scientific_facts_hi": (
            "आंखों में दर्द, लाली, सूखापन या पानी आना (Eye Strain / Conjunctivitis) स्क्रीन के अत्यधिक उपयोग, नींद की कमी या वायरल/बैक्टीरियल संक्रमण से होता है। "
            "कंप्यूटर या मोबाइल देखते समय आंखों की पलकें कम झपकती हैं, जिससे आंखों की प्राकृतिक नमी सूख जाती है।"
        ),
        "medicines": [
            {
                "name": "Carboxymethylcellulose 0.5% (Refresh Tears / Tears Naturale Drops)",
                "composition": "Preservative-Free Lubricating Ocular Polymer",
                "dosage": "1 to 2 drops in both eyes 3 to 4 times daily",
                "duration": "Ongoing as needed for screen strain",
                "purpose": "Stabilizes precorneal tear film, binds corneal surface microvilli, and provides sustained ocular hydration and comfort.",
                "caution": "Do not touch dropper tip to eyeball or fingers to prevent bacterial contamination."
            },
            {
                "name": "Moxifloxacin 0.5% Eye Drops (Vigamox) - ONLY IF BACTERIAL DISCHARGE PRESENT",
                "composition": "Fourth-Generation Fluoroquinolone Ophthalmic Antibacterial",
                "dosage": "1 drop in affected eye 3 times daily for 5 days (Strictly as prescribed by ophthalmologist)",
                "duration": "5 days",
                "purpose": "Inactivates bacterial DNA gyrase and topoisomerase IV, clearing mucopurulent conjunctival infection.",
                "caution": "Use only if yellow/green thick pus discharge is present under doctor guidance. Never self-prescribe steroid eye drops!"
            }
        ],
        "lifestyle_diet": [
            "20-20-20 Rule: Every 20 minutes of screen work, look at an object at least 20 feet away for 20 seconds to completely relax ciliary accommodation.",
            "Conscious Blinking: Practice deliberate full-eyelid blinking every few minutes to spread lipid layer across the cornea.",
            "Screen Distance & Lighting: Position monitors 20-24 inches from eyes with the top of screen slightly below eye level; eliminate glare.",
            "Cold Water Splash: Rinse face and eyes with cool clean drinking water to soothe ocular burning."
        ],
        "red_flags": "Severe deep boring eyeball pain, sudden decrease or loss of visual acuity, intense photophobia (inability to open eyes in normal light), or asymmetric cloudy cornea requires urgent emergency ophthalmology evaluation."
    },

    "back_pain_spine": {
        "keywords": ["back pain", "kamar dard", "lower back", "lumbago", "spine", "kamar me dard", "slip disc", "sciatica", "lumbar"],
        "condition": "Mechanical Lumbar Spondylogenic Strain & Paraspinal Spasm",
        "scientific_facts": (
            "Mechanical low back pain (L1-L5 / S1) accounts for > 85% of cases and involves microtrauma to paraspinal myofascial tissue (erector spinae, quadratus lumborum), "
            "facet joint capsule inflammation, or intervertebral disc annulus fibrosus strain. Prolonged seated slumping causes excessive intradiscal pressure (up to 200% compared to standing), "
            "leading to protective muscle hypertonicity and ischemic localized dull ache. Sciatic radiculopathy occurs if disc herniation compresses exiting L4-S1 nerve roots."
        ),
        "scientific_facts_hi": (
            "कमर दर्द (Lower Back Pain) रीढ़ की हड्डी के आसपास की मांसपेशियों में खिंचाव, गलत मुद्रा (Posture) में बैठने, "
            "भारी वजन उठाने या डिस्क पर दबाव के कारण होता है। लगातार कुर्सी पर झुककर बैठने से रीढ़ की डिस्क पर दोगुना दबाव पड़ता है, जिससे जकड़न और दर्द होता है।"
        ),
        "medicines": [
            {
                "name": "Thiocolchicoside 4mg + Paracetamol 325mg (Myoril Plus / Thiospas)",
                "composition": "Centrally Acting Muscle Relaxant + Analgesic",
                "dosage": "1 tablet twice daily after meals with water",
                "duration": "3 to 5 days short term",
                "purpose": "Competitively binds inhibitory GABA-A and glycinergic receptors in spinal cord, aborting painful paraspinal muscle contractures.",
                "caution": "Take strictly after food. May cause mild drowsiness."
            },
            {
                "name": "Diclofenac Diethylamine + Menthol Topical Gel (Volini / Voveran Gel)",
                "composition": "Topical NSAID + Cooling Counter-Irritant",
                "dosage": "Gently massage a small amount over lumbar backache area 2 to 3 times daily",
                "duration": "Until mobility improves",
                "purpose": "Penetrates transcutaneously to inhibit local COX-2 prostaglandin production without systemic gastric side effects.",
                "caution": "Do not apply on broken skin or immediately before hot bath."
            }
        ],
        "lifestyle_diet": [
            "Ergonomic Sitting Posture: Sit with hips all the way back against the chair; place a small lumbar cushion behind your lower back curve.",
            "Avoid Prolonged Bed Rest: Modern clinical guidelines strictly advise against bed rest beyond 24 hours. Gentle walking maintains spinal disc nutrient diffusion.",
            "Ice First, Then Heat: Apply an ice pack for 15 minutes during the first 24-48 hours of acute strain to reduce inflammation; use a heating pad thereafter for muscle relaxation.",
            "Safe Lifting Technique: Always bend at knees and hips (squat), keeping objects close to your chest; never bend forward at the waist with straight legs."
        ],
        "red_flags": "Radiating pain down the leg below the knee with foot drop/numbness, loss of urinary/bowel bladder control (Cauda Equina Syndrome), or back pain with unexplained fever and weight loss requires emergency neurosurgical hospitalization."
    },

    "knee_joint_arthritis": {
        "keywords": ["knee pain", "ghutno ka dard", "joint pain", "jodo ka dard", "arthritis", "sandhivata", "ghutna", "osteoarthritis", "crepitus"],
        "condition": "Degenerative Knee Osteoarthritis & Articular Cartilage Attrition",
        "scientific_facts": (
            "Knee Osteoarthritis involves progressive degradation of hyaline articular cartilage covering the femoral condyles and tibial plateau, "
            "accompanied by subchondral bone sclerosis, marginal osteophyte formation, and low-grade synovial inflammation. Reduction in synovial fluid "
            "viscoelasticity increases mechanical bone-on-bone friction during weight bearing, producing stiffness (especially morning stiffness < 30 mins) "
            "and audible joint crepitus upon flexion."
        ),
        "scientific_facts_hi": (
            "घुटनों व जोड़ों का दर्द (Joint Pain & Arthritis) उम्र, अधिक वजन या चोट के कारण जोड़ों के बीच का कार्टिलेज घिस जाने और साइनोवियल फ्लूइड (चिकनाई) कम होने से होता है। "
            "चलने, सीढ़ियां चढ़ने या नीचे बैठने पर घुटनों में कट-कट की आवाज और दर्द होना इसका मुख्य लक्षण है।"
        ),
        "medicines": [
            {
                "name": "Paracetamol 650mg (Dolo 650 / Calpol 650)",
                "composition": "Centrally Acting Non-Opioid Analgesic",
                "dosage": "1 tablet after meals (Max 3 tabs/day as needed)",
                "duration": "SOS for joint flare-ups",
                "purpose": "Recommended by international guidelines (OARSI) as the safest first-line analgesic for chronic osteoarthritis pain without gastrointestinal or renal toxicity.",
                "caution": "Do not exceed 3,000mg total paracetamol in 24 hours."
            },
            {
                "name": "Glucosamine Sulfate 1500mg + Chondroitin 1200mg (Jointace / Cartigen)",
                "composition": "Glycosaminoglycan Cartilage Precursor Formula",
                "dosage": "1 tablet once daily with meals",
                "duration": "3 months trial",
                "purpose": "Provides essential biochemical building blocks for proteoglycan synthesis in chondrocytes, supporting joint lubrication.",
                "caution": "Use with physician guidance if diabetic (mild glycemic monitoring)."
            },
            {
                "name": "Calcium Carbonate 500mg + Vitamin D3 250 IU (Shelcal 500)",
                "composition": "Elemental Calcium + Cholecalciferol",
                "dosage": "1 tablet once daily after lunch",
                "duration": "Long term bone health",
                "purpose": "Maintains subchondral bone mineral density and prevents osteoporotic microfractures.",
                "caution": "Drink plenty of water to prevent kidney stone formation."
            }
        ],
        "lifestyle_diet": [
            "Low-Impact Aerobic Exercise: Perform non-weight bearing exercises such as stationary cycling, swimming, and seated quadriceps leg extensions.",
            "Weight Management: Every 1 kg of excess body weight lost eliminates approximately 4 kg of repetitive impact force across the patellofemoral joint.",
            "Avoid Deep Squatting: Avoid sitting cross-legged on the floor (palthi marna) and avoid low western toilets; use higher chairs and knee braces for stability.",
            "Anti-Inflammatory Nutrition: Consume turmeric milk (curcumin has demonstrated COX-2 inhibitory effects), walnuts (omega-3 fatty acids), and flaxseed oil."
        ],
        "red_flags": "A hot, red, tense, severely swollen knee with fever and complete inability to bear weight suggests acute Septic Arthritis and requires immediate emergency arthrocentesis (joint fluid aspiration) in hospital."
    },

    "kidney_stones": {
        "keywords": ["kidney stone", "pathri", "gurde ki pathri", "renal calculi", "flank pain", "stone", "pathri ka dard", "ureteric stone"],
        "condition": "Nephrolithiasis & Acute Ureteric Calculous Spasm",
        "scientific_facts": (
            "Kidney stones precipitate when urinary solute concentrations (calcium, oxalate, uric acid) exceed saturation solubility limits in renal calyces. "
            "Over 80% are Calcium Oxalate stones. Acute renal colic occurs when a stone (> 4-5mm) dislodges into the narrow ureter, causing acute luminal obstruction, "
            "retrograde hydronephrosis, and intense stretching of renal capsule, sending excruciating paroxysmal flank pain radiating forward to the groin/testicle."
        ),
        "scientific_facts_hi": (
            "गुर्दे की पथरी (Kidney Stone) पेशाब में कैल्शियम, ऑक्सालेट या यूरिक एसिड के क्रिस्टल जमने से बनती है। "
            "जब पथरी पेशाब की नली (Ureter) में फंसती है, तो कमर के एक तरफ से पेट और जांघ की ओर असहनीय तेज दर्द (Renal Colic) उठता है और पेशाब में जलन या खून आ सकता है।"
        ),
        "medicines": [
            {
                "name": "Potassium Citrate + Magnesium Citrate Oral Solution (Potrate-MB / K-Cit Syrup)",
                "composition": "Urinary Alkalinizer & Oxalate Crystallization Inhibitor",
                "dosage": "15ml diluted in a full glass of water twice daily after meals",
                "duration": "1 to 2 months",
                "purpose": "Alkalinizes urinary pH and forms soluble complexes with calcium, halting stone growth and dissolving uric acid crystals.",
                "caution": "Check renal function (serum creatinine) before starting."
            },
            {
                "name": "Drotaverine 80mg + Mefenamic Acid 250mg (Drotikind-M)",
                "composition": "Smooth Muscle Phosphodiesterase-4 Inhibitor + NSAID",
                "dosage": "1 tablet after food SOS when flank colicky pain occurs",
                "duration": "SOS during acute stone spasm",
                "purpose": "Selectively inhibits phosphodiesterase in ureteric smooth muscles, relieving ureteral spasm and facilitating stone expulsion.",
                "caution": "Avoid on empty stomach."
            }
        ],
        "lifestyle_diet": [
            "Heavy Fluid Intake (3 to 3.5 Liters/Day): Maintain sufficient fluid intake to achieve a minimum daily urine output of 2.5 Liters (urine should look clear like water).",
            "Lemonade Therapy: Drink fresh lemon water daily; natural dietary citrate acts as a potent biological inhibitor of calcium oxalate nucleation.",
            "Limit Dietary Oxalate: Restrict high-oxalate foods: spinach (palak), beetroot, chocolate, almonds, black tea, and excessive tomato seeds.",
            "Moderate Sodium & Animal Protein: High sodium causes hypercalciuria (calcium dumping in urine); limit salt to < 2g/day."
        ],
        "red_flags": "High fever with chills and severe flank pain (Pyelonephritis / infected obstructed kidney), inability to pass any urine (anuria), or intractable vomiting requires emergency hospital admission for laser lithotripsy or DJ stenting."
    },

    "uti_infection": {
        "keywords": ["uti", "urinary infection", "peshab me jalan", "burning urine", "frequent urine", "peshab me dard", "urine infection", "cystitis"],
        "condition": "Acute Lower Urinary Tract Infection (Bacterial Cystitis)",
        "scientific_facts": (
            "Acute uncomplicated cystitis is predominantly caused by uropathogenic Escherichia coli (UPEC, ~80% of cases) ascending the short female urethra "
            "into the bladder lumen. Bacterial colonization triggers severe inflammatory response in uroepithelial lining, producing classical triad: "
            "dysuria (sharp burning during micturition), urinary urgency, and frequency (pollakiuria). Urine may appear turbid and emit pungent odor."
        ),
        "scientific_facts_hi": (
            "यूरिनरी ट्रैक्ट इन्फेक्शन (UTI) मूत्राशय में ई-कोलाई बैक्टीरिया के संक्रमण से होता है। "
            "इसके मुख्य लक्षणों में पेशाब करते समय तेज जलन (Burning), बार-बार पेशाब की हाजत होना, पेट के निचले हिस्से में दर्द और पेशाब में बदबू या धुंधलापन शामिल है।"
        ),
        "medicines": [
            {
                "name": "Disodium Hydrogen Citrate Syrup 1.4g/5ml (Cital / Alkaptrate)",
                "composition": "Systemic Urinary Alkalinizer",
                "dosage": "2 teaspoons (10ml) mixed in a full glass of water, sip 3 times daily after meals",
                "duration": "3 to 5 days",
                "purpose": "Raises urinary pH above 6.5, neutralizing acidic irritation of inflamed urothelium and providing rapid symptomatic relief from burning.",
                "caution": "Must always be diluted in water; do not drink concentrate."
            },
            {
                "name": "Nitrofurantoin Sustained Release 100mg (Martifur-SR / Niftran)",
                "composition": "Urinary Tract Specific Bactericidal Antibiotic",
                "dosage": "1 tablet twice daily after food for 5 days (Strictly under medical prescription)",
                "duration": "5 days",
                "purpose": "Concentrates exclusively in bladder urine, reducing bacterial ribosomal proteins and clearing coliform pathogens without affecting systemic gut flora.",
                "caution": "Prescription mandatory. Complete full 5-day course."
            }
        ],
        "lifestyle_diet": [
            "Copious Water Flushing: Drink 3 Liters of water daily to mechanically wash out bacteria from the bladder wall before colonization.",
            "Cranberry Extract (PACs): Pure cranberry extract containing Proanthocyanidins prevents E. coli p-fimbriae from adhering to urothelial receptors.",
            "Prompt Micturition: Do not hold urine for prolonged periods; empty bladder completely and urinate immediately after intercourse.",
            "Avoid Bladder Irritants: Eliminate caffeine, alcohol, artificial sweeteners, and spicy foods during active infection."
        ],
        "red_flags": "High spiking fever with shaking chills (rigors), flank back pain, nausea and vomiting (suggests ascending Acute Pyelonephritis to kidneys) requires urgent emergency parenteral antibiotic therapy in hospital."
    },

    "anemia_weakness": {
        "keywords": ["anemia", "khoon ki kami", "hemoglobin", "kamzori", "weakness", "thakan", "pale skin", "low hb", "fatigue", "chakkar weakness"],
        "condition": "Microcytic Hypochromic Iron Deficiency Anemia",
        "scientific_facts": (
            "Anemia is clinically diagnosed when circulating hemoglobin falls below WHO thresholds: < 13.0 g/dL in adult males, < 12.0 g/dL in non-pregnant females. "
            "Iron deficiency depletes bone marrow erythroblast ferritin stores, reducing heme synthesis and leading to microcytic, hypochromic red blood cells. "
            "Inadequate oxygen-carrying capacity triggers tissue hypoxia, compensatory tachycardia (resting heart rate increases to maintain cardiac output), "
            "exertional dyspnea, extreme chronic fatigue, pallor, and brittle spoon-shaped nails (koilonychia)."
        ),
        "scientific_facts_hi": (
            "खून की कमी (Anemia) में हीमोग्लोबिन स्तर सामान्य (पुरुष: 13-17 g/dL, महिला: 12-15 g/dL) से नीचे गिर जाता है। "
            "आयरन की कमी से शरीर के सभी अंगों और मस्तिष्क को ऑक्सीजन कम मिलती है, जिससे लगातार थकान, कमजोरी, सांस फूलना, चेहरे का पीलापन और चक्कर आना जैसे लक्षण होते हैं।"
        ),
        "medicines": [
            {
                "name": "Ferrous Ascorbate 100mg + Folic Acid 1.5mg (Orofer-XT / Autrin)",
                "composition": "Elemental Bioavailable Iron + Vitamin B9",
                "dosage": "1 tablet once daily at night 1 hour before dinner with plain water or citrus juice",
                "duration": "2 to 3 months (recheck CBC)",
                "purpose": "Ferrous iron (Fe2+) is rapidly absorbed in the duodenum, replenishing depleted bone marrow iron stores and accelerating reticulocyte hemoglobin synthesis.",
                "caution": "Do NOT take with tea, coffee, or milk (tannins and calcium inhibit iron absorption by up to 70%). Expect harmless dark black stools."
            },
            {
                "name": "Vitamin C (Ascorbic Acid) 500mg (Limcee / Celin)",
                "composition": "Ascorbic Acid",
                "dosage": "1 chewable tablet daily with iron supplement",
                "duration": "Concurrent with iron",
                "purpose": "Maintains iron in reduced soluble ferrous state, tripling intestinal absorption efficiency.",
                "caution": "Safe antioxidant vitamin."
            }
        ],
        "lifestyle_diet": [
            "Iron-Rich Dietary Sources: Consume pomegranate (anar), dates (khajoor), spinach (palak), beetroot, black raisins (kishmish), jaggery (gud), and roasted chickpeas (chana).",
            "Separate Tea/Coffee from Meals: Wait at least 1.5 hours after meals before having tea or coffee (tannins bind non-heme dietary iron into insoluble complexes).",
            "Cook in Cast Iron Cookware: Cooking acidic gravies in traditional iron kadhai leaches bioavailable elemental iron into the meal.",
            "De-worming Protocol: Take one Albendazole 400mg tablet (if advised by doctor) every 6 months to eliminate intestinal hookworms that cause occult blood loss."
        ],
        "red_flags": "Severe breathlessness even at rest, resting pulse > 120 BPM, chest pain upon walking, or hemoglobin < 7.0 g/dL requires urgent emergency hematologist consultation and possible packed red blood cell (PRBC) transfusion."
    },

    "vitamin_d_b12": {
        "keywords": ["vitamin d", "vitamin b12", "tingling", "sunn hona", "bone pain", "haddi me dard", "numbness", "b12", "vit d3", "calcium"],
        "condition": "Severe Hypovitaminosis D3 & Cobalamin Neurological Deficiency",
        "scientific_facts": (
            "Vitamin D3 (Cholecalciferol) acts as a steroid pre-hormone essential for enterocyte calcium/phosphorus absorption; deficiency (< 20 ng/mL) causes secondary "
            "hyperparathyroidism, osteomalacia, diffuse muscle aching, and fatigue. Vitamin B12 (Cobalamin) is a mandatory cofactor for methionine synthase; "
            "deficiency (< 200 pg/mL) causes defective myelin sheath maintenance in dorsal columns and peripheral nerves, causing peripheral neuropathy "
            "(glove-and-stocking paresthesias, burning soles, tingling, and numbness)."
        ),
        "scientific_facts_hi": (
            "विटामिन D3 हड्डियों, जोड़ों और रोग-प्रतिरोधक क्षमता के लिए अत्यंत जरूरी है। इसकी कमी से हड्डियों में दर्द और कमजोरी होती है। "
            "विटामिन B12 नसों (Nerves) के स्वास्थ्य के लिए आवश्यक है; इसकी कमी से हाथ-पैरों में झनझनाहट, सुन्नपन (Numbness), तलवों में जलन और याददाश्त में कमी आती है।"
        ),
        "medicines": [
            {
                "name": "Cholecalciferol 60,000 IU (Uprise-D3 / Calcirol Sachet or Capsule)",
                "composition": "High-Dose Vitamin D3 (Cholecalciferol)",
                "dosage": "1 capsule or sachet mixed in warm milk once weekly for 8 consecutive weeks, then once a month maintenance",
                "duration": "8 weeks loading + monthly maintenance",
                "purpose": "Rapidly replenishes hepatic calcidiol (25-OH-D) stores, normalizing bone mineralization and cellular immune function.",
                "caution": "Fat-soluble vitamin; always consume after a heavy meal containing healthy dietary fats or with whole milk."
            },
            {
                "name": "Methylcobalamin 1500mcg + Alpha Lipoic Acid (Nurokind-Plus / Cobadex)",
                "composition": "Bioactive Vitamin B12 + Neuroprotective Antioxidant",
                "dosage": "1 tablet once daily after lunch with water",
                "duration": "1 to 2 months",
                "purpose": "Promotes peripheral nerve myelin sheath regeneration, abolishing tingling sensations, peripheral numbness, and neurological fatigue.",
                "caution": "Safe water-soluble vitamin."
            }
        ],
        "lifestyle_diet": [
            "Morning Sun Exposure: Expose arms, legs, and face to natural mid-morning sunlight for 15-20 minutes without sunscreen (UVB synthesizes cutaneous previtamin D3).",
            "Vitamin D Dietary Sources: Fortified milk, egg yolks, mushrooms exposed to sunlight, paneer, and salmon/mackerel fish.",
            "Vitamin B12 Dietary Sources: Dairy products (curd, cheese, milk), fortified breakfast cereals, eggs, poultry, and nutritional yeast (essential for strict vegetarians).",
            "Regular Periodic Screening: Test serum 25-Hydroxy Vitamin D and serum Vitamin B12 every 6-12 months."
        ],
        "red_flags": "Progressive unsteady gait (loss of balance in dark / sensory ataxia), severe memory loss, or profound muscle tetany with low calcium requires immediate parenteral injection therapy."
    },

    "migraine_headache": {
        "keywords": ["migraine", "adha sir dard", "aadha sir", "pulsating headache", "throbbing head", "light sensitivity", "nausea headache", "sir ghumna"],
        "condition": "Acute Migraine Cephalea & Trigeminal Vascular Sensitization",
        "scientific_facts": (
            "Migraine is a neurovascular pain disorder involving cortical spreading depression (CSD), abnormal dural neurogenic inflammation, "
            "and trigeminovascular activation with localized release of Calcitonin Gene-Related Peptide (CGRP) and substance P. This produces severe unilateral, "
            "pulsating, throbbing headache typically lasting 4 to 72 hours, exacerbated by physical movement, and accompanied by photophobia (light sensitivity), "
            "phonophobia (sound sensitivity), and nausea."
        ),
        "scientific_facts_hi": (
            "माइग्रेन (Migraine) आधे सिर का तेज धड़कता हुआ दर्द होता है। यह दिमाग की नसों और रसायनों में असंतुलन के कारण होता है। "
            "इसके साथ जी मिचलाना, उल्टी का मन होना और तेज रोशनी या तेज आवाज से घबराहट/दर्द बढ़ना प्रमुख लक्षण हैं।"
        ),
        "medicines": [
            {
                "name": "Naproxen 500mg + Domperidone 10mg (Napra-D / Naxdom 500)",
                "composition": "Long-Acting NSAID + Prokinetic Antiemetic",
                "dosage": "1 tablet taken immediately at the earliest onset of migraine aura or headache with a meal",
                "duration": "SOS single dose (do not repeat within 12 hours)",
                "purpose": "Potently suppresses meningeal neurogenic inflammation and restores gastric motility to relieve co-occurring nausea.",
                "caution": "Take with food. Not suitable if active stomach ulcer is present."
            },
            {
                "name": "Paracetamol 650mg + Caffeine (Dolo-650)",
                "composition": "Acetaminophen Analgesic",
                "dosage": "1 tablet as a mild alternative if Naproxen cannot be tolerated",
                "duration": "SOS",
                "purpose": "Central pain modulation.",
                "caution": "Do not take more than 3 tabs daily."
            }
        ],
        "lifestyle_diet": [
            "Dark Quiet Room Rest: Lie down immediately in a pitch-dark, quiet room; apply a cold ice pack over the forehead or back of the neck.",
            "Identify & Eliminate Food Triggers: Avoid aged cheeses (tyramine), chocolate, monosodium glutamate (MSG/Ajinomoto), artificial sweeteners, and red wine.",
            "Maintain Strict Sleep & Meal Regularity: Skipping meals and irregular sleep schedules trigger rapid migraine attacks; eat at scheduled hours.",
            "Stay Well Hydrated: Drink 500ml of cold electrolyte water immediately when prodromal symptoms begin."
        ],
        "red_flags": "Sudden 'thunderclap' headache reaching maximum peak intensity within 60 seconds ('worst headache of life' - subarachnoid hemorrhage risk), new onset headache with focal arm/leg weakness, or headache with stiff neck and high fever requires immediate emergency brain CT/MRI in hospital."
    },

    "sore_throat_tonsils": {
        "keywords": ["sore throat", "gala dard", "tonsils", "tonsillitis", "gale me kharash", "swallowing pain", "gala kharab", "throat infection"],
        "condition": "Acute Viral/Bacterial Pharyngitis & Palatine Tonsillitis",
        "scientific_facts": (
            "Pharyngitis and tonsillitis involve acute mucosal inflammation of the oropharynx and palatine tonsillar lymphoid tissue. "
            "Etiology is viral in > 70% of cases (Rhinovirus, Adenovirus, Coronavirus, Epstein-Barr virus). Bacterial tonsillitis is commonly caused by "
            "Group A beta-hemolytic Streptococcus (GABS / Strep throat). Clinically characterized by painful odynophagia (swallowing pain), erythema, "
            "tonsillar exudates, and tender anterior cervical lymphadenopathy."
        ),
        "scientific_facts_hi": (
            "गले में दर्द, खराश और टॉन्सिल में सूजन (Sore Throat / Tonsillitis) ज्यादातर वायरल या बैक्टीरियल इन्फेक्शन के कारण होती है। "
            "निगलते समय गले में तेज दर्द होना, गले में कांटे जैसा चुभना और बुखार आना इसके सामान्य लक्षण हैं।"
        ),
        "medicines": [
            {
                "name": "Warm Saline Gargles + Povidone Iodine 2% Gargle (Betadine Gargle)",
                "composition": "Topical Antiseptic / Hypertonic Microbicidal Solution",
                "dosage": "Dilute 10ml Betadine gargle in 10ml warm water; gargle for 30 seconds 3 times daily (do not swallow)",
                "duration": "3 to 4 days",
                "purpose": "Kills surface viral and bacterial pathogens on contact and reduces mucosal osmotic edema and pain.",
                "caution": "Spit out completely after gargling. Not for long term use."
            },
            {
                "name": "Amylmetacresol + Dichlorobenzyl Alcohol Lozenges (Strepsils / Cofsils)",
                "composition": "Soothing Throat Antiseptic Lozenges",
                "dosage": "Slowly dissolve 1 lozenge in mouth every 3 to 4 hours as needed",
                "duration": "2 to 3 days",
                "purpose": "Moistens dry pharyngeal mucosa and provides localized pain relief.",
                "caution": "Do not chew; let dissolve slowly."
            },
            {
                "name": "Azithromycin 500mg (Azee 500) - ONLY FOR SEVERE BACTERIAL STREP THROAT",
                "composition": "Macrolide Antibiotic",
                "dosage": "1 tablet once daily 1 hour before dinner for 3 days strictly under doctor's prescription",
                "duration": "3 days",
                "purpose": "Eradicates bacterial Streptococcus pyogenes.",
                "caution": "Do not self-medicate for common viral colds."
            }
        ],
        "lifestyle_diet": [
            "Warm Saline Gargles: Gargle with 1/2 teaspoon of salt in a glass of warm water 3 to 4 times a day (draws out excess fluid from swollen throat tissues).",
            "Warm Honey & Ginger: Drink warm water or green tea with pure honey and fresh ginger juice (honey has natural antimicrobial and demulcent properties).",
            "Avoid Cold / Sour Foods: Strictly avoid cold drinks, ice cream, refrigeration items, and sour citrus or vinegar items during active throat pain.",
            "Steam Inhalation: Inhale warm steam for 5 minutes twice daily to humidify dry inflamed vocal cords."
        ],
        "red_flags": "Difficulty breathing, inability to swallow saliva (drooling), inability to open the mouth (trismus / Peritonsillar Abscess risk), or high fever with muffled 'hot potato' voice requires immediate emergency ENT hospitalization."
    },

    "heart_palpitations": {
        "keywords": ["palpitations", "dil ki dhadkan", "dhadkan tez", "flutter", "heart rate fast", "tachycardia", "heart pounding", "chhati me dhadkan"],
        "condition": "Hyperadrenergic Sinus Tachycardia & Benign Cardiac Palpitations",
        "scientific_facts": (
            "Palpitations represent the heightened subjective sensory awareness of cardiac contractions, commonly characterized as pounding, fluttering, "
            "or skipped beats. In over 80% of outpatient cases, palpitations represent benign Sinus Tachycardia (resting Heart Rate > 100 BPM) or isolated "
            "Premature Ventricular/Atrial Contractions (PVCs/PACs) triggered by elevated sympathetic adrenergic tone, acute emotional stress, caffeine, "
            "nicotine, fever (heart rate rises ~10 BPM per 1°C increase in temperature), acute dehydration, or hyperthyroidism."
        ),
        "scientific_facts_hi": (
            "दिल की धड़कन अचानक तेज होना या छाती में धक-धक महसूस होना (Palpitations) अत्यधिक चाय/कॉफी (कैफीन), पानी की कमी (Dehydration), "
            "तनाव, चिंता, या बुखार होने पर नर्वस सिस्टम के उत्तेजित होने से होता है। शांत होकर बैठना और गहरी सांस लेना धड़कन को सामान्य करने में मदद करता है।"
        ),
        "medicines": [
            {
                "name": "ORS (Oral Rehydration Solution) / Electrolyte Hydration",
                "composition": "WHO Balance Electrolytes (Sodium, Potassium, Glucose)",
                "dosage": "Drink 1 glass (300ml) slowly over 10 minutes",
                "duration": "Immediate SOS",
                "purpose": "Rapidly expands intravascular plasma volume, normalizing venous return and terminating reflex sinus tachycardia.",
                "caution": "Safe natural first aid."
            },
            {
                "name": "Propranolol 10mg / 20mg (Ciplar) - STRICTLY PRESCRIPTION ONLY",
                "composition": "Non-Selective Beta-Adrenergic Blocker",
                "dosage": "Only as specifically prescribed by a Cardiologist after ECG evaluation",
                "duration": "As directed",
                "purpose": "Blocks cardiac beta-1 receptors, blunting excessive sympathetic drive and lowering heart rate.",
                "caution": "Contraindicated in asthma and low resting blood pressure."
            }
        ],
        "lifestyle_diet": [
            "Vagal Nerve Maneuver (Valsalva): Take a deep breath and gently bear down as if having a bowel movement for 10-15 seconds, or splash cold water on your face to stimulate parasympathetic vagal slowing of heart rate.",
            "Diaphragmatic 4-7-8 Breathing: Inhale slowly for 4 seconds, hold for 7 seconds, exhale through mouth for 8 seconds. This directly calms the sympathetic nervous system.",
            "Cut Out Stimulants: Stop all caffeine (coffee, energy drinks, strong tea), tobacco/nicotine, and decongestant cold syrups.",
            "Sit and Rest: Sit down comfortably in a cool room, loosen tight collars, and rest quietly for 15 minutes."
        ],
        "red_flags": "Palpitations accompanied by crushing central chest pain radiating to jaw or left arm, sudden lightheaded syncope (blacking out), severe shortness of breath, or resting Heart Rate > 150 BPM requires IMMEDIATE emergency ECG and ambulance call."
    },

    "piles_hemorrhoids": {
        "keywords": ["piles", "bawaseer", "hemorrhoids", "anal bleeding", "stool bleeding", "shauch me khoon", "mass", "fissure", "anal pain"],
        "condition": "Hemorrhoidal Disease & Anal Fissure Management",
        "scientific_facts": (
            "Hemorrhoids represent pathologically engorged, prolapsed vascular cushions in the anal canal consisting of arteriovenous sinusoids, "
            "connective tissue, and smooth muscle. Elevated intra-abdominal pressure from chronic straining during constipation or prolonged toilet sitting "
            "causes stretching and rupture of overlying mucosal veins, resulting in painless, bright red rectal bleeding coating the stool surface. "
            "Anal fissures represent acute linear tears in the anoderm causing severe sharp burning pain during and after defecation."
        ),
        "scientific_facts_hi": (
            "बवासीर (Piles / Hemorrhoids) मलाशय की नसों में सूजन और खून की नसें फूलने से होती है। "
            "लंबे समय तक कब्ज रहना और शौच के समय अधिक जोर लगाना इसका सबसे बड़ा कारण है। मल त्यागते समय चमकीला लाल खून आना और दर्द/मस्से निकलना इसके मुख्य लक्षण हैं।"
        ),
        "medicines": [
            {
                "name": "Warm Water Sitz Bath Protocol",
                "composition": "Hydrotherapy with Luke-Warm Plain Water",
                "dosage": "Sit in a tub of warm water covering the hips for 15 minutes twice daily (especially after bowel movements)",
                "duration": "1 to 2 weeks",
                "purpose": "Directly relaxes hypertonic internal anal sphincter spasm, dramatically reducing pain and improving local venous microcirculation.",
                "caution": "Use comfortable warm water, not scalding hot."
            },
            {
                "name": "Lidocaine + Hydrocortisone Rectal Cream (Anovate / Shield)",
                "composition": "Local Anesthetic + Mild Anti-Inflammatory",
                "dosage": "Apply gently inside and around anal opening using applicator twice daily after sitz bath",
                "duration": "5 to 7 days short term",
                "purpose": "Numbs acute anoderm pain receptors and reduces vascular engorgement.",
                "caution": "Do not use steroid creams continuously beyond 7 days."
            },
            {
                "name": "Calcium Dobesilate 500mg (Dobesil / Osil)",
                "composition": "Microvascular Venotonic & Capillary Stabilizer",
                "dosage": "1 capsule twice daily with meals for 15 days",
                "duration": "2 weeks",
                "purpose": "Strengthens venous capillary wall resistance, reduces hyperpermeability, and arrests bleeding.",
                "caution": "Take with meals."
            }
        ],
        "lifestyle_diet": [
            "Never Strain on Toilet: Do not sit on the toilet seat for more than 5 minutes (never read smartphones on the commode; prolonged gravity increases venous engorgement).",
            "High Fiber Diet: Take 2 tablespoons of Isabgol husk in warm water every night to ensure soft, bulky stools that pass without any friction.",
            "Drink 3 Liters of Water: Keep stool hydrated and soft at all times.",
            "Avoid Dry Toilet Paper: Clean gently with lukewarm water and pat dry with a soft cloth; avoid rough dry toilet paper."
        ],
        "red_flags": "Continuous active dripping of dark blood, dizziness or pallor from blood loss (severe anemia), or excruciating constant thrombosed external hemorrhoid pain requires urgent colorectal surgical review."
    },

    "diet_weight_loss": {
        "keywords": ["weight loss", "vajan kam", "belly fat", "motapa", "fat loss", "lose weight", "diet plan", "calorie deficit", "vajan ghatana"],
        "condition": "Clinical Obesity & Evidence-Based Caloric Deficit Protocol",
        "scientific_facts": (
            "Sustainable body fat loss is governed by the First Law of Thermodynamics: an energy deficit of 300 to 500 kcal/day below Total Daily Energy Expenditure (TDEE) "
            "induces safe mobilization of adipose tissue triglycerides at a rate of 0.5 to 1.0 kg per week. Adequate dietary protein (1.2 to 1.6 g/kg ideal body weight) "
            "is critical to preserve lean skeletal muscle mass and elevate diet-induced thermogenesis. Restricting high-glycemic carbohydrates reduces serum insulin spikes, "
            "enabling hormone-sensitive lipase (HSL) to hydrolyze stored fat into free fatty acids."
        ),
        "scientific_facts_hi": (
            "वजन और पेट की चर्बी कम करने का एकमात्र वैज्ञानिक तरीका 'कैलोरी डेफिसिट' (Calorie Deficit) है, यानी शरीर जितनी कैलोरी खर्च करता है उससे 300-500 कैलोरी कम खाना। "
            "मीठा, मैदा और तला-भुना पूरी तरह बंद करना, भरपूर प्रोटीन (दालें, पनीर, अंडे) और रेशेदार सब्जियां खाना, तथा रोजाना 10,000 कदम चलना वजन घटाने के सबसे असरदार नियम हैं।"
        ),
        "medicines": [],
        "lifestyle_diet": [
            "Calorie Deficit Principle: Reduce daily intake by 400-500 kcal; track portions. Never crash diet below 1200 kcal (causes metabolic slowdown and muscle loss).",
            "Eliminate Liquid Sugar: Zero intake of sugar, soft drinks, packed juices, and sweets. Drink black coffee, green tea, or warm lemon water instead.",
            "High Protein & High Fiber: Every meal must contain protein (sprouted moong, paneer, tofu, boiled egg whites) and 50% plate filled with raw salad/vegetables.",
            "10,000 Steps Daily: Non-Exercise Activity Thermogenesis (NEAT) from walking burns more weekly calories than occasional intense gym sessions.",
            "Intermittent Fasting (16:8): Eat within an 8-hour window (e.g., 11:00 AM to 7:00 PM) and fast on water for 16 hours to boost insulin sensitivity."
        ],
        "red_flags": "Unintentional rapid weight loss (> 5 kg in 1 month without dieting) accompanied by night sweats, persistent cough, or loss of appetite is a warning sign of underlying systemic illness (Thyrotoxicosis, Diabetes, Malignancy, Tuberculosis) requiring thorough medical workup."
    },

    "diet_weight_gain": {
        "keywords": ["weight gain", "vajan badhana", "underweight", "dubla patla", "gain weight", "muscle gain", "vajan badhaye", "body banana"],
        "condition": "Nutritional Underweight & Hypertrophic Muscle Mass Accretion",
        "scientific_facts": (
            "Healthy weight gain requires a structured caloric surplus of 300 to 500 kcal/day above maintenance TDEE, combined with progressive resistance training "
            "to stimulate myofibrillar protein synthesis (hypertrophy) rather than solely accumulating visceral adiposity. Ideal macronutrient distribution: "
            "Protein: 1.6-2.0 g/kg body weight; Carbohydrates: 45-55% of total calories (glycogen replenishment); Fats: 25-30% of healthy unsaturated fats."
        ),
        "scientific_facts_hi": (
            "स्वस्थ तरीके से वजन और मांसपेशियों (Muscles) का निर्माण करने के लिए शरीर को 'कैलोरी सरप्लस' (300-500 अतिरिक्त कैलोरी) की आवश्यकता होती है। "
            "जंक फूड खाकर वजन बढ़ाने से सिर्फ चर्बी और पेट बढ़ता है। सही तरीका है: दूध, केला, ओट्स, पीनट बटर, पनीर, दालें और हल्के वजन के व्यायाम।"
        ),
        "medicines": [
            {
                "name": "Ashwagandha Powder / Tablets 500mg",
                "composition": "Withania Somnifera Herbal Adaptogen",
                "dosage": "1 tablet or 1 teaspoon powder twice daily with warm full-cream milk",
                "duration": "2 to 3 months",
                "purpose": "Enhances anabolic vitality, reduces cortisol-mediated catabolism, and improves physical strength and appetite.",
                "caution": "Safe natural botanical."
            }
        ],
        "lifestyle_diet": [
            "Nutrient-Dense Calorie Smoothies: Drink a daily shake made of 1 glass full cream milk + 2 bananas + 2 tablespoons peanut butter + 30g soaked oats + 5 soaked almonds.",
            "Frequent Meals: Eat 5 to 6 small nutrient-rich meals a day rather than 2 large heavy meals.",
            "Healthy Fats: Add a teaspoon of pure desi ghee, olive oil, walnuts, and pumpkin seeds to everyday dal and rotis.",
            "Resistance & Strength Training: Perform bodyweight squats, push-ups, and dumbbell strength training 3-4 days a week to ensure excess calories turn into muscle mass."
        ],
        "red_flags": "Severe underweight with Body Mass Index (BMI) < 16.5 kg/m2, persistent chronic diarrhea, or family history of endocrine disorder requires clinical screening for Celiac Disease, Hyperthyroidism, or Malabsorption."
    },

    "water_hydration": {
        "keywords": ["water", "pani", "kitna pani", "how much water", "hydration", "drinking water", "water intake", "daily water"],
        "condition": "Human Fluid Homeostasis & Daily Water Intake Guidelines",
        "scientific_facts": (
            "The human body is approximately 60% water by weight. Daily water loss via renal excretion (1.5L), perspiration (0.5L), respiration (0.4L), "
            "and feces (0.2L) totals roughly 2.5 Liters daily. According to the National Academy of Medicine (NAM) and WHO: "
            "• Adult Men require ~3.0 to 3.7 Liters total fluid daily (~12-14 glasses).\n"
            "• Adult Women require ~2.2 to 2.7 Liters total fluid daily (~9-11 glasses).\n"
            "• Children (4-8y): 1.2 to 1.4 Liters/day; Adolescents: 1.8 to 2.4 Liters/day.\n"
            "• Elderly adults need conscious scheduled hydration (thirst sensation blunts with advancing age due to osmoreceptor decline)."
        ),
        "scientific_facts_hi": (
            "स्वस्थ रहने के लिए प्रतिदिन पानी की सही मात्रा:\n"
            "• वयस्क पुरुष: लगभग 3.0 से 3.5 लीटर (12 से 14 गिलास) प्रतिदिन।\n"
            "• वयस्क महिला: लगभग 2.2 से 2.7 लीटर (9 से 11 गिलास) प्रतिदिन।\n"
            "• बच्चे (4-12 वर्ष): 1.5 से 2.0 लीटर प्रतिदिन।\n"
            "• बुजुर्ग: कम से कम 2 से 2.5 लीटर (बुजुर्गों में प्यास लगने का संकेत कम हो जाता है, इसलिए समय-समय पर पानी पीना जरूरी है)।\n\n"
            "पेशाब का रंग हल्का पीला या पानी जैसा साफ होना चाहिए; गहरा पीला रंग पानी की कमी का साफ संकेत है।"
        ),
        "medicines": [],
        "lifestyle_diet": [
            "Morning Water Habit: Drink 500ml (2 glasses) of lukewarm water immediately upon waking to reactivate metabolism and flush overnight digestive toxins.",
            "Check Urine Color Rule: Pale straw yellow indicates optimal hydration; dark amber urine indicates acute cellular dehydration.",
            "Sip Regularly: Sip water throughout the day rather than chugging a whole liter at once (which triggers rapid renal excretion without cellular hydration).",
            "Pre-Meal Rule: Drink water 30 minutes before meals; avoid drinking large amounts of chilled water during or immediately after meals to avoid diluting gastric digestive enzymes."
        ],
        "red_flags": "Dark brown tea-colored urine, absence of urination for > 8 hours, extreme dizziness upon standing, or cracked dry lips with confusion indicates severe dehydration requiring immediate clinical attention."
    },

    "sleep_timing": {
        "keywords": ["sleep", "neend", "kitne ghante sona", "how many hours sleep", "sleeping time", "sleep hours", "sleep duration", "sone ka samay"],
        "condition": "Circadian Chronobiology & Evidence-Based Sleep Duration Standards",
        "scientific_facts": (
            "The National Sleep Foundation and American Academy of Sleep Medicine (AASM) establish age-specific restorative sleep standards:\n"
            "• Infants & Toddlers: 11 to 14 hours per 24 hours.\n"
            "• Children (6-12y): 9 to 12 hours.\n"
            "• Teenagers (13-18y): 8 to 10 hours.\n"
            "• Adults (18-64y): 7 to 9 hours nightly.\n"
            "• Older Adults (≥ 65y): 7 to 8 hours nightly.\n"
            "A standard human sleep cycle lasts ~90 minutes and cycles through Stage N1, N2, N3 (Slow-Wave Deep Sleep - physical repair, growth hormone release), "
            "and REM (Rapid Eye Movement - memory consolidation, cognitive emotional processing). Getting less than 6 hours elevates systemic inflammatory markers (IL-6, CRP), "
            "increases insulin resistance, and elevates resting blood pressure."
        ),
        "scientific_facts_hi": (
            "स्वास्थ्य विज्ञान के अनुसार उम्र के आधार पर सोने के सही घंटे:\n"
            "• छोटे बच्चे (6-12 वर्ष): 9 से 12 घंटे की नींद।\n"
            "• किशोर (13-18 वर्ष): 8 से 10 घंटे।\n"
            "• वयस्क (18-64 वर्ष): 7 से 9 घंटे की गहरी नींद।\n"
            "• बुजुर्ग (65 वर्ष या अधिक): 7 से 8 घंटे।\n\n"
            "रात 10:00 से 10:30 बजे के बीच सोना सबसे आदर्श है क्योंकि रात 11 से 3 बजे के बीच शरीर में सबसे ज्यादा रिपेयरिंग और मेलाटोनिन हार्मोन बनता है।"
        ),
        "medicines": [],
        "lifestyle_diet": [
            "Fixed Sleep Schedule: Go to bed and wake up at the exact same time every single day (even on weekends) to synchronize the suprachiasmatic nucleus master clock.",
            "No Screens in Bed: Avoid mobile, TV, and laptop screens 60 minutes before bed (blue 460nm wavelength light suppresses pineal melatonin).",
            "Keep Bedroom Cool & Pitch Dark: Core body temperature must fall by 1°C to initiate deep slow-wave sleep; use blackout curtains.",
            "Avoid Heavy Late Dinners: Finish dinner at least 2.5 to 3 hours before sleeping so digestion does not disrupt sleep architecture."
        ],
        "red_flags": "Loud chronic snoring accompanied by gasping or pauses in breathing during sleep (Obstructive Sleep Apnea - OSA), or severe daytime sleepiness causing falling asleep while driving requires overnight Polysomnography (Sleep Study)."
    },

    "blood_tests_guide": {
        "keywords": ["blood test", "cbc", "lft", "kft", "lipid profile", "hba1c test", "full body test", "blood report", "normal value", "test range"],
        "condition": "Clinical Pathology Laboratory Reference Ranges",
        "scientific_facts": (
            "Standard Diagnostic Clinical Reference Ranges (Adult Norms):\n"
            "• Hemoglobin (Hb): Men: 13.5-17.5 g/dL | Women: 12.0-15.5 g/dL\n"
            "• Total White Blood Cell (WBC): 4,000 to 11,000 /mcL\n"
            "• Platelets: 1.5 to 4.5 Lakhs /mcL\n"
            "• Fasting Blood Sugar: 70 to 99 mg/dL | Postprandial: < 140 mg/dL\n"
            "• HbA1c (3-Month Sugar): Normal: < 5.7% | Prediabetes: 5.7-6.4% | Diabetes: ≥ 6.5%\n"
            "• Serum Creatinine (Kidney): 0.7 to 1.3 mg/dL\n"
            "• Total Cholesterol: < 200 mg/dL | LDL ('Bad'): < 100 mg/dL | HDL ('Good'): > 50 mg/dL\n"
            "• SGPT / ALT (Liver): < 45 U/L | Serum Bilirubin: 0.2 to 1.2 mg/dL\n"
            "• TSH (Thyroid): 0.45 to 4.5 mIU/L."
        ),
        "scientific_facts_hi": (
            "प्रमुख ब्लड टेस्ट और उनकी सामान्य सीमाएं (Normal Values):\n"
            "• हीमोग्लोबिन (Hb): पुरुष: 13-17 g/dL | महिला: 12-15 g/dL\n"
            "• प्लेटलेट्स: 1.5 से 4.5 लाख /mcL (डेंगू में 1 लाख से नीचे जाने पर डॉक्टर को दिखाएं)\n"
            "• फास्टिंग शुगर (खाली पेट): 70 से 100 mg/dL (126 से ऊपर डायबिटीज)\n"
            "• HbA1c: 5.7% से कम सामान्य, 6.5% से ऊपर डायबिटीज\n"
            "• सीरम क्रिएटिनिन (किडनी): 0.7 से 1.2 mg/dL\n"
            "• टोटल कोलेस्ट्रॉल: 200 mg/dL से कम | LDL: 100 से कम\n"
            "• TSH (थायराइड): 0.4 से 4.5 mIU/L"
        ),
        "medicines": [],
        "lifestyle_diet": [
            "Fasting Protocol: For Fasting Blood Sugar and Lipid Profile tests, maintain a strict 10-12 hour overnight fast (only plain water is permitted).",
            "Hydration before Blood Draw: Drink a glass of water before phlebotomy to make veins plump and prevent syncope.",
            "Annual Health Checkup: Everyone above 30 years should undergo routine annual CBC, Lipid, HbA1c, and Renal function testing."
        ],
        "red_flags": "Platelets < 50,000 /mcL with petechiae, Serum Creatinine > 2.5 mg/dL, Fasting Sugar > 300 mg/dL, or Hemoglobin < 7 g/dL indicates high-risk critical alert requiring immediate hospital care."
    }
}


# =========================================================================
# DYNAMIC CLINICAL REASONING & INQUIRY SYNTHESIZER
# =========================================================================
def synthesize_dynamic_medical_response(
    query_text: str,
    vitals: Dict[str, Any],
    lang: str = "en"
) -> Dict[str, Any]:
    """
    Synthesizes a deep, scientifically authentic, tailored medical response
    for open-ended inquiries, dietary combinations, home remedies, pediatric care,
    or physiological questions, incorporating real-time patient sensor telemetry.
    """
    q = query_text.lower().strip()
    hr = vitals.get("heart_rate", 75)
    temp = vitals.get("temperature_c", 36.8)
    spo2 = vitals.get("spo2", 98)

    # Telemetry evaluation block
    if lang == "hi":
        vitals_text = (
            f"\n\n📊 आपके वर्तमान IoT सेंसर वाइटल्स का विश्लेषण:\n"
            f"• हृदय गति (Heart Rate): {hr} BPM ({'सामान्य व स्वस्थ' if 60 <= hr <= 100 else 'समीक्षा आवश्यक'})\n"
            f"• शारीरिक तापमान (Body Temp): {temp}°C ({'सामान्य' if 36.0 <= temp <= 37.3 else 'हल्का बढ़ा हुआ'})\n"
            f"• रक्त ऑक्सीजन (SpO2): {spo2}% ({'उत्कृष्ट सेचुरेशन' if spo2 >= 95 else 'ऑक्सीजन पर ध्यान दें'})"
        )
    else:
        vitals_text = (
            f"\n\n📊 Real-Time Patient IoT Sensor Telemetry:\n"
            f"• Heart Rate: {hr} BPM ({'Optimal Resting Rhythm' if 60 <= hr <= 100 else 'Review Recommended'})\n"
            f"• Body Temperature: {temp}°C ({'Normothermic' if 36.0 <= temp <= 37.3 else 'Elevated / Subfebrile'})\n"
            f"• Blood Oxygen (SpO2): {spo2}% ({'Optimal Saturation' if spo2 >= 95 else 'Mild Desaturation'})"
        )

    # Semantic Keyword Flags
    is_food = any(k in q for k in ["dinner", "breakfast", "lunch", "eat", "food", "diet", "khana", "bhojan", "kya khaye", "parhez", "roti", "sabji", "fruit", "rice", "sweet", "salad"])
    is_dairy = any(k in q for k in ["milk", "doodh", "curd", "dahi", "tea", "chai", "coffee", "juice", "drink", "peena", "peena chahiye", "turmeric milk", "haldi"])
    is_fever = any(k in q for k in ["fever", "bukhar", "temperature", "cold", "jukham", "sardi", "cough", "khansi"])
    is_bp = any(k in q for k in ["bp", "blood pressure", "hypertension", "raktchap", "high bp", "systolic"])
    is_sugar = any(k in q for k in ["sugar", "diabetes", "madhumeh", "glucose", "hba1c"])
    is_acidity = any(k in q for k in ["acidity", "gas", "gerd", "reflux", "heartburn", "jalan", "bloating"])
    is_stomach = (
        (any(k in q for k in ["pet", "stomach", "abdomen", "abdominal"]) and any(k in q for k in ["dard", "pain", "cramp", "marod", "spasm", "ache", "kharab", "tez"]))
        or any(k in q for k in ["pet dard", "pet me dard", "stomach ache", "belly pain", "abdominal pain"])
    )
    is_eye = any(k in q for k in ["eye", "aankh", "vision", "nazar", "screen", "mobile", "computer", "strain", "chashma", "dry eye", "redness"])
    is_joint = (
        any(k in q for k in ["knee", "ghutna", "back pain", "kamar dard", "spine", "joint pain", "jod me dard", "neck pain", "gardan dard", "bone pain", "haddi me dard", "arthritis", "sandhivata"])
        or (("knee" in q or "ghutna" in q or "joint" in q) and ("exercise" in q or "walk" in q or "dard" in q))
    )
    is_sleep = any(k in q for k in ["sleep", "neend", "insomnia", "so nahi", "sleeping", "sone ka"])
    is_pediatric = any(k in q for k in ["child", "bachha", "bachhe", "baby", "kid", "infant", "toddler"])
    is_uric_acid = any(k in q for k in ["uric acid", "gout", "purine", "uric"])

    # 1. DIET & DINNER WITH HIGH BP
    if is_bp and is_food:
        condition = "उच्च रक्तचाप में संतुलित रात्रि भोजन (Dinner in High BP)" if lang == "hi" else "Optimal Dietary Dinner Protocol for Hypertension Management"
        assessment = (
            "रक्तचाप (High BP) के मरीजों के लिए रात का भोजन विशेष रूप से महत्वपूर्ण होता है। "
            "सामान्य शरीर विज्ञान के अनुसार, स्वस्थ व्यक्तियों में रात को सोते समय रक्तचाप 10-20% स्वाभाविक रूप से कम होता है (जिसे 'Nocturnal BP Dipping' कहते हैं)। "
            "यदि रात में अधिक नमक (Sodium), तला-भुना या भारी भोजन किया जाए, तो यह प्राकृतिक गिरावट रुक जाती है और हृदय व धमनियों पर रात भर दबाव बना रहता है।\n\n"
            "रात के खाने के मुख्य नियम:\n"
            "1. कम नमक (Low Sodium): रात के खाने में नमक की मात्रा 1/4 चम्मच से कम रखें। ऊपर से कच्चा नमक, पापड़ या अचार बिल्कुल न लें।\n"
            "2. सोने से 2.5 से 3 घंटे पहले भोजन: शाम 7:30 से 8:30 के बीच डिनर समाप्त कर लें ताकि पाचन पूरा हो सके।\n"
            "3. पोटैशियम युक्त हल्की सब्जियां: लौकी, तोरी, परवल, मूंग दाल की खिचड़ी, या उबली सब्जियां सर्वोत्तम हैं। पोटैशियम शरीर से अतिरिक्त सोडियम को पेशाब के रास्ते बाहर निकालता है।\n"
            "4. लहसुन का प्रयोग: डिनर में लहसुन की 1-2 कलियां शामिल करने से नाइट्रिक ऑक्साइड बढ़ता है जो रक्त वाहिकाओं को शिथिल रखता है।"
            if lang == "hi" else
            "Dinner selection plays a paramount role in systemic blood pressure regulation. "
            "Under normal circadian physiology, nocturnal blood pressure naturally dips by 10% to 20% during deep sleep (the 'Nocturnal Dipping' phenomenon). "
            "Consuming high-sodium, heavy, or late-night dinners prevents this hemodynamic recovery, maintaining high intravascular pressure and straining arterial endothelium overnight.\n\n"
            "Core Clinical Dinner Guidelines for Hypertension:\n"
            "1. Strict Sodium Restriction: Limit evening sodium to < 500mg (under 1/4 teaspoon). Strictly avoid pickles, papad, processed cheese, and canned soups.\n"
            "2. 3-Hour Pre-Sleep Window: Conclude dinner at least 2.5 to 3 hours before bedtime to allow complete gastric clearance.\n"
            "3. Potassium-Rich Light Choices: Consume steamed bottle gourd (lauki), ridge gourd (turai), yellow moong dal soup, or oats khichdi. Potassium activates renal natriuresis, eliminating excess sodium.\n"
            "4. Dietary Vasodilators: Including a crushed clove of fresh garlic releases allicin, which promotes endothelial nitric oxide synthase and vascular compliance."
        )
        medicines = []
        lifestyle = [
            "Maintain dinner salt below 1/4 teaspoon; avoid dining out or ordering restaurant gravies.",
            "Finish dinner before 8:30 PM; never lie down immediately after eating.",
            "Take a gentle 15-minute slow stroll after dinner to aid digestion.",
            "Avoid black tea, coffee, alcohol, or chocolate late in the evening."
        ]
        red_flags = "Systolic BP > 180 mmHg or Diastolic > 120 mmHg with severe occipital headache, blurred vision, or chest heaviness requires immediate emergency care."

    # 2. MILK & DAIRY DURING FEVER / ILLNESS
    elif is_dairy and is_fever:
        condition = "बुखार में दूध के सेवन का चिकित्सीय विश्लेषण (Milk Intake during Fever)" if lang == "hi" else "Clinical Evaluation: Milk & Dairy Intake during Febrile Illness"
        assessment = (
            "हाँ, बुखार में दूध पिया जा सकता है, लेकिन इसके कुछ महत्वपूर्ण चिकित्सीय नियम हैं। "
            "बुखार के दौरान शरीर में साइटोकाइन (Pyrogens) के कारण गैस्ट्रिक गतिशीलता (Gastric Motility) धीमी हो जाती है और आमाशय में पाचक एंजाइम कम बनते हैं। "
            "इसलिए ठंडा, मलाईदार (Full-Cream) या भारी दूध पीने से जी मिचलाना, उल्टी या अपच हो सकती है।\n\n"
            "सही तरीका: गाय का हल्का (Toned / Skimmed) उबला हुआ गुनगुना दूध पिएं। "
            "दूध में 1/4 चम्मच शुद्ध हल्दी (Curcumin) और एक चुटकी काली मिर्च मिलाकर पीने से यह प्राकृतिक एंटी-इंफ्लेमेटरी और इम्युनिटी बूस्टर का कार्य करता है। "
            "यदि रोगी को उल्टी या तेज दस्त हो रहे हों, तो कुछ घंटों के लिए दूध रोककर ओआरएस (ORS) या नारियल पानी देना चाहिए।"
            if lang == "hi" else
            "Yes, milk can be safely consumed during febrile illness, provided clinical guidelines are respected. "
            "During fever, endogenous pyrogenic cytokines induce mild gastroparesis (slowing gastric emptying) and reduce digestive enzyme secretion. "
            "Consuming chilled, full-cream, or heavy dairy can exacerbate nausea, gastric bloating, or gastroesophageal discomfort.\n\n"
            "Clinical Best Practice: Administer warm, low-fat (skimmed/toned) boiled milk. "
            "Adding 1/4 teaspoon of pure turmeric (Curcumin) with a pinch of piperine (black pepper) creates a potent natural immunomodulator and anti-inflammatory beverage. "
            "If the patient presents with active nausea or profuse watery diarrhea, temporarily withhold dairy and prioritize clear oral rehydration fluids (WHO-ORS or coconut water)."
        )
        medicines = []
        lifestyle = [
            "Drink warm turmeric milk (Golden Milk) 30 minutes before sleep for restorative comfort.",
            "Strictly avoid chilled, unboiled, or sweetened heavy milkshakes during fever or cough.",
            "If phlegm/mucus is heavy, replace bedtime milk with warm ginger-tulsi water or vegetable soup.",
            "Ensure 2.5 to 3.0 Liters of warm fluids across the day to support thermoregulation."
        ]
        red_flags = "Spiking fever above 39.5°C (103°F), persistent vomiting preventing all fluid retention, or extreme lethargy requires urgent medical attention."

    # 3. EYE STRAIN & SCREEN PAIN
    elif is_eye:
        condition = "नेत्र तनाव एवं डिजिटल स्क्रीन स्ट्रेन (Digital Eye Strain / Asthenopia)" if lang == "hi" else "Asthenopia & Computer Vision Syndrome (Digital Eye Strain)"
        assessment = (
            "मोबाइल या कंप्यूटर स्क्रीन अधिक देर तक देखने से आंखों में दर्द, भारीपन और पानी आने की मुख्य वजह 'सिलियरी मांसपेशियों में ऐंठन' (Ciliary Muscle Spasm) है। "
            "सामान्य अवस्था में मनुष्य 1 मिनट में 15 से 20 बार पलकें झपकाता है, लेकिन स्क्रीन पर ध्यान केंद्रित करते समय यह घटकर सिर्फ 5 से 7 बार रह जाती है। "
            "पलकें कम झपकने से आंखों की सुरक्षात्मक आंसू परत (Tear Film) सूख जाती है, जिससे कॉर्निया में सूखापन (Dry Eyes), जलन और सिरदर्द होने लगता है।\n\n"
            "इसके निवारण के लिए 20-20-20 का वैज्ञानिक नियम अपनाएं: हर 20 मिनट के स्क्रीन समय के बाद, 20 फीट दूर किसी वस्तु को 20 सेकंड तक देखें।"
            if lang == "hi" else
            "Ocular pain, periorbital aching, and burning from prolonged screen exposure stem from 'accommodative asthenopia' (continuous contraction of the ciliary muscles). "
            "Under normal conditions, humans blink 15 to 20 times per minute, continuously replenishing the precorneal tear film. "
            "During intensive screen viewing, blink frequency drops drastically by 60% (to 5-7 blinks/min), accelerating evaporative tear loss, triggering dry eye micro-friction, and inducing tension headache.\n\n"
            "The international ophthalmic gold standard is the 20-20-20 Rule: every 20 minutes, look at an object 20 feet away for 20 continuous seconds to relax ciliary accommodation."
        )
        medicines = [
            {
                "name": "Carboxymethylcellulose 0.5% Eye Drops (Refresh Tears / Tear Naturale)",
                "composition": "Lubricating Ophthalmic Surface Protective Polymer",
                "dosage": "1 drop into both eyes 3 to 4 times daily as needed",
                "duration": "As needed during intensive screen work",
                "purpose": "Restores corneal tear film moisture, eliminating burning and friction.",
                "caution": "Keep dropper tip sterile; discard 30 days after opening."
            }
        ]
        lifestyle = [
            "Follow the 20-20-20 Rule strictly: Every 20 minutes, rest eyes by focusing 20 feet away for 20 seconds.",
            "Maintain Ergonomic Screen Distance: Keep computer monitor at arm's length (20-24 inches) slightly below eye level.",
            "Avoid Dark-Room Screen Use: Never use mobile screens in complete darkness; ambient room lighting prevents extreme pupil dilation.",
            "Conscious Blinking: Consciously blink every few seconds while reading or coding."
        ]
        red_flags = "Sudden loss of visual acuity, flashing lights or floaters, severe ocular redness with rainbow halos around lights indicates acute glaucoma or retinal crisis requiring urgent emergency ophthalmologist care."

    # 3B. STOMACH PAIN & FUNCTIONAL GASTRIC SPASM
    elif is_stomach:
        condition = "तीव्र उदर शूल व आमाशय ऐंठन (Acute Abdominal Pain & Gastric Spasm)" if lang == "hi" else "Acute Abdominal Pain & Functional Gastric Spasm"
        assessment = (
            "पेट में तेज दर्द (Abdominal Spasm) आमतौर पर आमाशय या आंतों की चिकनी मांसपेशियों में अत्यधिक संकुचन, "
            "तीव्र गैस बनने, या गैस्ट्राइटिस/अपच के कारण होता है। यदि दर्द रुक-रुक कर मरोड़ (Cramps) के साथ उठता है, "
            "तो यह आंतों की मांसपेशियों में ऐंठन (Hyperactive Peristalsis) का स्पष्ट संकेत है।"
            if lang == "hi" else
            "Acute abdominal pain with cramping predominantly arises from hyperactive visceral smooth muscle spasm, "
            "luminal gas distension, or acute mucosal gastritis. Intermittent colicky cramping reflects spasmodic contractions "
            "of intestinal peristaltic loops stimulating visceral C-fiber pain receptors."
        )
        medicines = [
            {
                "name": "Dicyclomine 10mg + Mefenamic Acid 250mg (Meftal-Spas / Spasmonil)",
                "composition": "Antispasmodic + NSAID",
                "dosage": "1 tablet SOS after light food when pain is severe",
                "duration": "SOS short term",
                "purpose": "Rapidly relaxes visceral smooth muscle spasm and terminates abdominal cramping.",
                "caution": "Take after food. Avoid if stomach bleeding is suspected."
            }
        ]
        lifestyle = [
            "Apply a warm hot water bag over the lower abdomen to relax tense muscles.",
            "Sip warm water or light peppermint/chamomile tea slowly.",
            "Strictly avoid oily, spicy fried foods, raw onions, and carbonated sodas.",
            "Eat very light soft foods (moong dal khichdi, boiled curd rice)."
        ]
        red_flags = "Severe rigid board-like belly, continuous vomiting with inability to hold water, high fever, or severe localized pain in lower right abdomen (Appendicitis risk) requires immediate hospital surgical evaluation."

    # 4. KNEE & JOINT PAIN / EXERCISES
    elif is_joint:
        condition = "जोड़ों व घुटनों का बायोमैकेनिकल स्वास्थ्य (Joint Biomechanics & Knee Care)" if lang == "hi" else "Musculoskeletal Rehabilitation & Knee Joint Biomechanics"
        assessment = (
            "घुटनों और जोड़ों में दर्द आमतौर पर आर्टिकुलर कार्टिलेज (Cartilage) के घिसने, साइनोवियल फ्लूइड की कमी, या कमजोर क्वाड्रिसेप्स मांसपेशियों के कारण होता है। "
            "जब जांघ की मांसपेशियां (Quadriceps) कमजोर होती हैं, तो शरीर के वजन का पूरा दबाव घुटने के जोड़ पर पड़ता है, जिससे दर्द और सूजन आती है।\n\n"
            "व्यायाम और पुनर्वास के नियम:\n"
            "1. आइसोमेट्रिक क्वाड्रिसेप्स एक्सरसाइज: सीधे लेटकर या बैठकर घुटने के नीचे तौलिया मोड़कर रखें और घुटने से तौलिए को 5 सेकंड दबाएं, फिर ढीला छोड़ें (10 बार दोहराएं)।\n"
            "2. स्ट्रेट लेग रेज (SLR): सीधे लेटकर पैर को 30 डिग्री ऊपर उठाएं और 5 सेकंड रोकें। यह घुटने पर बिना दबाव डाले जांघ की मांसपेशियों को मजबूत करता है।\n"
            "3. जमीन पर पालथी मारकर बैठने और गहरे उठक-बैठक से बचें।"
            if lang == "hi" else
            "Knee joint discomfort and degenerative pain predominantly arise from gradual thinning of articular cartilage and relative weakness of the stabilizing quadriceps femoris musculature. "
            "When the quadriceps lacks tone, direct ground-reactive forces during walking transfer directly to the patellofemoral and tibiofemoral joint spaces, accelerating cartilage wear.\n\n"
            "Clinical Joint Rehabilitation Protocol:\n"
            "1. Isometric Quadriceps Sets: Sit with knee extended over a rolled towel; press knee down firmly into towel for 5 seconds, then relax (repeat 10-15 cycles twice daily).\n"
            "2. Straight Leg Raises (SLR): Supine leg lift to 30 degrees, hold 5 seconds. Builds primary quad strength without patellofemoral friction.\n"
            "3. Low-Impact Aerobics: Stationary upright cycling with high seat or swimming provides synovial circulation without high-impact compressive loading."
        )
        medicines = [
            {
                "name": "Diclofenac Diethylamine + Methyl Salicylate Gel (Volini / Omnigel)",
                "composition": "Topical Non-Steroidal Anti-Inflammatory Gel",
                "dosage": "Apply gently over painful joint area 2-3 times daily (do not vigorously rub)",
                "duration": "5 to 7 days SOS",
                "purpose": "Local topical pain and swelling reduction with minimal systemic absorption.",
                "caution": "Do not apply on broken or irritated skin."
            }
        ]
        lifestyle = [
            "Perform Isometric Knee Extensions daily to strengthen knee-supporting muscles.",
            "Maintain Healthy Body Weight: Every 1 kg of weight loss reduces 4 kg of pressure off knees.",
            "Avoid squatting completely or sitting cross-legged on the floor if knees ache.",
            "Apply ice pack for acute swelling (15 mins), or warm heating pad for chronic morning stiffness."
        ]
        red_flags = "Inability to bear any weight on leg, joint locked in bent position, or hot red swelling with fever (Septic Arthritis risk) requires immediate orthopedic consultation."

    # 5. PEDIATRIC FEVER & CHILD CARE
    elif is_pediatric:
        condition = "बाल चिकित्सा: बच्चों में बुखार व स्वास्थ्य प्रबंधन (Pediatric Health & Fever Care)" if lang == "hi" else "Pediatric Clinical Guidance & Febrile Care"
        assessment = (
            "छोटे बच्चों में बुखार शरीर की प्रतिरक्षा प्रणाली (Immune System) का संक्रमण से लड़ने का एक स्वाभाविक संकेत है। "
            "बच्चों में 37.5°C (99.5°F) से ऊपर तापमान को बुखार माना जाता है।\n\n"
            "बाल-चिकित्सा के प्राथमिक नियम:\n"
            "1. जलयोजन (Hydration): बच्चे को थोड़ा-थोड़ा करके पानी, नारियल पानी, हल्का सूप या दाल का पानी पिलाते रहें।\n"
            "2. हल्का खाना: जबरदस्ती भारी भोजन न कराएं; पतली खिचड़ी, दलिया, उबला आलू या केला दें।\n"
            "3. सामान्य तापमान का स्पंजिंग (Tepid Sponging): यदि तापमान 101°F से ऊपर हो तो माथे, गर्दन और बगलों पर सादे गुनगुने पानी की पट्टी रखें (बर्फ का पानी कभी न लगाएं)।\n"
            "4. चेतावनी: 16 वर्ष से कम उम्र के बच्चों को कभी भी एस्पिरिन (Disprin) न दें (Reye's Syndrome का गंभीर खतरा होता है)।"
            if lang == "hi" else
            "In children, fever is a physiological immune response to viral or bacterial antigens. Core pediatric body temperature above 37.5°C (99.5°F) represents fever.\n\n"
            "Core Pediatric Protocols:\n"
            "1. Diligent Hydration: Administer small sips of fluids (ORS, coconut water, thin dal soup) every 15-20 minutes to prevent dehydration.\n"
            "2. Easily Digestible Soft Foods: Provide warm porridge, soft rice khichdi, mashed potatoes, or stewed apples.\n"
            "3. Tepid Water Sponging: For temperature exceeding 38.3°C (101°F), apply washcloths soaked in lukewarm tap water over forehead and neck (never use ice or cold water).\n"
            "4. Critical Safety Rule: NEVER administer Aspirin to children under 16 years due to risk of fatal Reye's Syndrome."
        )
        medicines = [
            {
                "name": "Paracetamol Pediatric Syrup 120mg/5ml or 250mg/5ml",
                "composition": "Acetaminophen Antipyretic",
                "dosage": "10 to 15 mg per kg body weight every 6 hours SOS (strictly as prescribed by pediatrician)",
                "duration": "SOS for fever > 100°F",
                "purpose": "Safely reduces high temperature and pediatric body aches.",
                "caution": "Always measure dose with oral syringe or calibrated dropper. Never exceed weight-adjusted dose."
            }
        ]
        lifestyle = [
            "Dress child in single-layer loose cotton clothing; do not over-wrap in heavy blankets.",
            "Keep room well-ventilated and comfortable (~24-25°C).",
            "Monitor oral fluid intake and ensure urination at least once every 4 to 6 hours.",
            "Never self-medicate with leftover antibiotics without pediatrician review."
        ]
        red_flags = "Child is excessively drowsy, difficult to wake, has seizures/convulsions, breathing very rapidly with chest indrawing, or refusing all fluids requires emergency hospital pediatric casualty admission."

    # 6. DIET IN DIABETES / SUGAR
    elif is_sugar and is_food:
        condition = "मधुमेह में संतुलित ग्लाइसेमिक आहार (Dietary Glycemic Protocol in Diabetes)" if lang == "hi" else "Glycemic Index & Clinical Nutrition Protocol in Diabetes"
        assessment = (
            "डायबिटीज (शुगर) के नियंत्रण में भोजन का ग्लाइसेमिक इंडेक्स (GI) सबसे महत्वपूर्ण भूमिका निभाता है। "
            "हाई-जीआई खाद्य पदार्थ (जैसे मैदा, सफेद चावल, चीनी) खून में ग्लूकोज का स्तर तेजी से बढ़ाते हैं जिससे इंसुलिन प्रतिरोध बढ़ता है। "
            "कम जीआई और उच्च घुलनशील फाइबर वाले खाद्य पदार्थ (जैसे ओट्स, रागी, जौ, मेथी, करेला, दालें) आंतों में ग्लूकोज के अवशोषण को धीमा कर देते हैं।\n\n"
            "भोजन के प्रमुख वैज्ञानिक नियम:\n"
            "1. प्लेट नियम (Plate Method): 50% प्लेट हरी व कच्ची सब्जियों/सलाद से भरें, 25% दाल/अंडा/पनीर (प्रोटीन), और सिर्फ 25% मोटे अनाज (Complex Carbs) रखें।\n"
            "2. मेथी दाना: रात में 1 चम्मच मेथी दाना पानी में भिगोकर सुबह चबाकर पानी पिएं।\n"
            "3. भोजन के तुरंत बाद 15 मिनट टहलें (Postprandial Walk) ताकि मांसपेशियां बिना इंसुलिन के अतिरिक्त ग्लूकोज को सोख सकें।"
            if lang == "hi" else
            "Nutritional regulation in diabetes centers around glycemic load and carbohydrate absorption kinetics. "
            "High-glycemic foods induce rapid postprandial glucose excursions that overwhelm beta-cell secretory capacity. "
            "In contrast, high soluble fiber fractions (beta-glucan, fenugreek galactomannan) form viscous gels in the proximal duodenum, slowing glucose diffusion and improving peripheral insulin sensitivity.\n\n"
            "Core Clinical Rules for Diabetic Diet:\n"
            "1. The 50-25-25 Plate Rule: 50% non-starchy cruciferous vegetables and raw salads, 25% lean protein (sprouted moong, paneer, egg whites), and 25% whole millets (sorghum/jowar, finger millet/ragi).\n"
            "2. Postprandial Ambulation: Walk for 15 minutes immediately following major meals to trigger insulin-independent GLUT4 glucose uptake by skeletal muscle.\n"
            "3. Eliminate Liquid Sugars: Zero sodas, packaged juices, sweetened tea, or bakery products."
        )
        medicines = []
        lifestyle = [
            "Follow the 50-25-25 plate method at every meal.",
            "Take a 15-minute walk after every meal to blunt postprandial sugar spikes.",
            "Check Fasting and Postprandial blood glucose weekly on your glucometer.",
            "Limit high-fructose fruits (mango, grapes, chiku); choose papaya, guava, and berries."
        ]
        red_flags = "Fasting glucose > 250 mg/dL with extreme thirst, frequent urination, fruity breath odor, or confusion indicates diabetic ketoacidosis (DKA) or hyperosmolar crisis requiring emergency hospital care."

    # 7. URIC ACID & GOUT DIET
    elif is_uric_acid:
        condition = "यूरिक एसिड व गाउट में आहार नियंत्रण (Dietary Purine Restriction in Gout)" if lang == "hi" else "Purine Catabolism & Dietary Protocol in Hyperuricemia"
        assessment = (
            "यूरिक एसिड शरीर में प्यूरीन (Purine) नामक प्रोटीन के टूटने से बनता है। जब रक्त में यूरिक एसिड का स्तर 7.0 mg/dL से ऊपर चला जाता है, "
            "तो मोनोसोडियम यूरेट क्रिस्टल जोड़ों (विशेषकर पैर के अंगूठे, टखने) में जमा होकर असहनीय दर्द और सूजन (Gout) पैदा करते हैं।\n\n"
            "परहेज एवं सावधानियां:\n"
            "1. क्या बिल्कुल न खाएं: रेड मीट, सीफूड, बीयर/शराब, राजमा, साबुत उड़द, मशरूम, और हाई-फ्रुक्टोज कॉर्न सिरप (कोल्ड ड्रिंक्स)।\n"
            "2. क्या खाएं: चेरी (Cherry), नींबू पानी (Vitamin C यूरिक एसिड को पेशाब से बाहर निकालता है), लो-फैट दही, और खीरा/लौकी।\n"
            "3. भरपूर पानी: दिन में 3 से 3.5 लीटर पानी पिएं ताकि किडनी अतिरिक्त यूरिक एसिड को फिल्टर कर सके।"
            if lang == "hi" else
            "Hyperuricemia arises when serum urate exceeds solubility thresholds (> 6.8-7.0 mg/dL), precipitating monosodium urate needle-like crystals into articular synovium. "
            "High-purine proteins directly fuel xanthine oxidase purine degradation, driving acute gout flares.\n\n"
            "Evidence-Based Dietary Protocol:\n"
            "1. Strictly Prohibited: Red meat, organ meats (liver), shellfish, beer/ethanol (ethanol generates lactic acid which competitively inhibits renal urate clearance), and high-fructose corn syrups.\n"
            "2. Therapeutic Foods: Tart cherries (anthocyanins suppress xanthine oxidase), daily Vitamin C 500mg (uricosuric action), and low-fat dairy products.\n"
            "3. Renal Flushing: Drink at least 3.2 Liters of clean water daily to optimize renal glomerular urate clearance."
        )
        medicines = []
        lifestyle = [
            "Drink 3.0 to 3.5 Liters of water daily to wash out urate crystals through kidneys.",
            "Strictly avoid alcohol, beer, red meat, and sweetened soft drinks.",
            "Consume 1 glass of fresh lemon water daily for urine alkalinization.",
            "Avoid crash starvation diets (ketosis impairs uric acid excretion)."
        ]
        red_flags = "Acute excruciating inflammation of great toe or joint with high fever and shaking chills requires immediate rheumatologist review."

    # 8. GENERAL HEALTH & OPEN CLINICAL INQUIRY
    else:
        condition = f"नैदानिक स्वास्थ्य परामर्श: {query_text[:35]}" if lang == "hi" else f"Clinical Health Guidance: {query_text[:35]}"
        assessment = (
            f"आपके प्रश्न '{query_text}' का वैज्ञानिक व चिकित्सकीय विश्लेषण:\n\n"
            f"मानव शरीर विज्ञान (Human Physiology) के अनुसार, अंग प्रणालियों का सुचारू संचालन तीन मुख्य प्रक्रियाओं पर निर्भर करता है: "
            f"कोशिकीय जलयोजन (Cellular Hydration), संतुलित चयापचय (Metabolic Homeostasis), और स्वायत्त तंत्रिका तंत्र (Autonomic Balance)। "
            f"खान-पान में पर्याप्त माइक्रोन्यूट्रिएंट्स (विटामिन, एंटीऑक्सिडेंट) और फाइबर शामिल करने से शरीर की रोग प्रतिरोधक क्षमता और ऊर्जा स्तर उच्च बना रहता है।"
            if lang == "hi" else
            f"Evidence-Based Clinical Analysis for '{query_text}':\n\n"
            f"According to established human physiology, optimal systemic function depends on three interconnected axes: "
            f"adequate cellular hydration (30-35 ml/kg), metabolic equilibrium (balanced macronutrient distribution with low glycemic variability), "
            f"and autonomic nervous system balance between sympathetic drive and parasympathetic restorative tone. "
            f"Prioritizing nutrient-dense whole foods rich in bioactive phytochemicals, dietary fiber, and adequate hydration directly optimizes cellular repair mechanisms."
        )
        medicines = []
        lifestyle = [
            "Maintain structured fluid intake of 2.5 to 3.0 Liters of water daily.",
            "Incorporate 30 minutes of moderate physical activity (brisk walking, stretching) at least 5 days weekly.",
            "Maintain consistent meal timings with high dietary fiber and minimal processed sugars.",
            "Ensure 7 to 8 hours of restorative circadian sleep nightly."
        ]
        red_flags = "Sudden onset of chest pain radiating to left arm, severe shortness of breath, sudden facial asymmetry or slurred speech requires immediate emergency 112 paramedic care."

    full_assessment = assessment + vitals_text

    return {
        "urgency": "NORMAL / CLINICAL GUIDANCE",
        "condition_diagnosed": condition,
        "clinical_assessment": full_assessment,
        "prescribed_medicines": medicines,
        "dietary_lifestyle": lifestyle,
        "red_flags": red_flags,
        "emergency_actions": ["Track your live sensor vitals on the SmartHealth dashboard."],
        "source": "SmartHealth Clinical Medical Intelligence",
        "api_connected": True,
        "vitals_considered": {"heart_rate": hr, "temp_c": temp, "spo2": spo2}
    }
