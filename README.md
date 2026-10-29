# 🏥 SmartHealth: IoT & AI Patient Lifeline Platform

A complete, production-grade Healthcare IoT & Telemetry Platform engineered for patients and elderly care. Integrates ESP32 hardware sensors (MAX30102, DS18B20, MPU6050, NEO-6M GPS) with a **FastAPI Python Backend (Render)**, **MongoDB Database**, **React Frontend (Vercel)**, and a **Dedicated Native Android App**.

---

## 🌟 Key Requirements Implemented

1. **🚦 3-Zone Tri-Color Clinical Health Engine**:
   - 🟢 **GREEN ZONE (Normal)**: All vitals (Heart Rate 60–100 BPM, SpO2 95–100%, Temp 36.1–37.2°C, Accel < 2.5g) are stable. Daily wellness tips provided.
   - 🟡 **YELLOW ZONE (Average / Moderate Warning)**: Mild fever (37.3–39.4°C), tachycardia (101–130 BPM), or borderline SpO2 (90–94%). **Automatically delivers clinical suggestions and medicine advice**:
     - *Fever*: Paracetamol 500mg/650mg dosage, hydration, cold forehead compress.
     - *Tachycardia*: Electrolyte ORS solution, 4-7-8 vagal nerve breathing, rest in Fowler's posture.
     - *Mild Hypoxia*: Prone position, room ventilation, steam inhalation.
   - 🔴 **RED ZONE (Critical Emergency)**: Extreme arrhythmia (<45 or >130 BPM), SpO2 < 90%, fever > 39.5°C, or **Fall Impact Detected**. Dispatches paramedic siren, broadcasts GPS coordinates, and triggers immediate SOS phone dialing.

2. **🚨 Fall Detection & Emergency SOS Phone Dialer**:
   - Real-time impact detection via **MPU6050** (>2.5g impact force).
   - Audio siren alarm + voice synthesizer announcement.
   - 10-second safety cancellation countdown (to prevent accidental false alarms).
   - **Auto-dials primary contact or Emergency 112** via `tel:112` on Web & Android Native Call Intent.
   - Dispatches emergency SMS with live GPS coordinates and Google Maps pin.

3. **📱 Dedicated Android Application**:
   - Complete native Android project in `android_app/` with AndroidManifest permissions (`CALL_PHONE`, `SEND_SMS`, `ACCESS_FINE_LOCATION`, `VIBRATE`).
   - Native JavaScript Bridge (`MainActivity.java`) to directly invoke the Android telephone dialer, SMS manager, and haptic vibrator.
   - Standalone mobile web application in `android_app/app/src/main/assets/www/index.html`.

4. **⚡ 30+ Advanced Healthcare Features**:
   1. Real-time IoT vitals telemetry streaming (WebSocket & REST)
   2. 3-Zone Tri-Color Health Status banner
   3. Smart Medicine & Care Recommendations for Yellow/Average zone
   4. Automatic Fall Detection with 10s countdown & Phone Dialer
   5. Live GPS Location Tracking (NEO-6M GPS) & Google Maps navigation
   6. Real-Time PPG Heart Pulse Waveform (Canvas visualizer synced to MAX30102 BPM)
   7. Acoustic Siren & Voice Alerts (Web Audio API & Android TTS)
   8. Emergency Contacts Manager (Ambulance 112, Cardiologist, Family Guardian)
   9. One-Click Manual SOS Panic Button
   10. Interactive AI Medical Assistant & Symptom Checker (Hindi/English triage)
   11. Daily Medicine Reminder & Dosage Timetable with remaining pill stock
   12. Daily Hydration & Water Intake Tracker (2500ml target with 1-tap logging)
   13. Sleep Quality & Circadian Rhythm Analyzer (Deep sleep, REM, resting sleep HR)
   14. Interactive BMI, BMR & Body Metrics Calculator
   15. Pathology & Lab Diagnostic Reports Vault (Sugar, Lipid, Creatinine, Hb)
   16. Doctor Appointment Scheduler (In-clinic and teleconsultation slots)
   17. Simulated Telemedicine Live Video Consultation Room
   18. Comprehensive Organ Health Index (Heart, Lungs, Liver, Kidneys, Immunity)
   19. Clinical 10-Year Disease Risk Predictor (Cardio, Hypertension, Stroke)
   20. Historical Vitals Trend Analytics
   21. Printable / Downloadable Clinical Health Summary Report (PDF)
   22. Patient Profile & Medical ID (Blood group, allergies, chronic conditions)
   23. Personalized Dietary & Nutrition Plan (Therapeutic for Yellow, Balanced for Green)
   24. Stress & HRV Relaxation Guidance
   25. Guided 4-7-8 Breathing Circle for lowering elevated heart rate
   26. Posture & Activity Step Monitor
   27. Family Guardian / Caregiver Remote Watch Mode
   28. Vaccination & Immunization Tracker
   29. Smart Hardware IoT Simulator Bar (Normal, Fever, Tachycardia, Fall, Critical)
   30. Bilingual English / Hindi (हिन्दी) Interface Toggle
   31. Dark Mode / Light Mode Theme Toggle
   32. Offline Storage & Reconnect Banner
   33. Audit Log / Alert Incident History

---

## 📁 Repository Structure

```
d:/smarthealth/
├── iotworkingcode/
│   ├── iotworkingcode.ino          # Original ESP32 sketch (MAX30102, DS18B20, MPU6050, GPS)
│   ├── iotworkingcode_wifi.ino     # Enhanced WiFi & Cloud ESP32 firmware with auto Fall SOS
│   └── iot_serial_bridge.py        # Python bridge for plug-and-play USB Serial connection
├── backend/
│   ├── main.py                     # FastAPI server with 30+ endpoints & WebSockets
│   ├── models.py                   # Pydantic data schemas
│   ├── recommendations.py          # 3-Zone clinical rule engine & medicine advice
│   ├── simulator.py                # Biological IoT sensor waveform generator
│   ├── database.py                 # MongoDB Atlas client with crashproof in-memory fallback
│   ├── requirements.txt            # Python dependencies
│   ├── render.yaml                 # Render cloud deployment specification
│   ├── Procfile & Dockerfile       # Container and web process configs
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/             # 15+ specialized modular React components
│   │   ├── utils/                  # Web Audio synthesizer & EN/HI translations
│   │   ├── App.jsx                 # Master application controller
│   │   ├── index.css               # Design system & animations
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json                 # Vercel deployment configuration
└── android_app/
    ├── app/
    │   ├── src/main/
    │   │   ├── AndroidManifest.xml # CALL_PHONE, SEND_SMS, GPS permissions
    │   │   ├── java/com/smarthealth/app/MainActivity.java # Native call & vibration bridge
    │   │   ├── res/layout/activity_main.xml
    │   │   └── assets/www/index.html # Touch-optimized mobile web app
    │   └── build.gradle
    ├── build.gradle
    └── settings.gradle
```

---

## 🚀 Deployment Instructions

### 1. Frontend Deployment on Vercel
1. Push this repository to GitHub or run with Vercel CLI.
2. In the Vercel Dashboard, select the `frontend` folder as Root Directory:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://<YOUR-RENDER-BACKEND-URL>.onrender.com`
4. Click **Deploy**. Vercel will automatically build and publish your site!

### 2. Backend Deployment on Render
1. In the Render Dashboard, create a new **Web Service** pointing to the `backend` folder.
2. Configuration:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/smarthealth`)
   - `DB_NAME`: `smarthealth`
4. Render will start the server and provide your HTTPS cloud endpoint.

### 3. Local Development
#### Start Backend:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

#### Start Frontend:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔌 Connecting Physical ESP32 Hardware

### Method A: Direct WiFi (Standalone ESP32)
1. Open `iotworkingcode/iotworkingcode_wifi.ino` in Arduino IDE.
2. Set your WiFi credentials:
   ```cpp
   const char* WIFI_SSID = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* SERVER_URL = "https://your-backend.onrender.com"; // or http://192.168.x.x:8000
   ```
3. Flash to ESP32. The hardware will stream live heart rate, SpO2, temperature, and GPS to the cloud every 2 seconds, and immediately trigger the SOS route if an impact (>2.5g) occurs.

### Method B: USB Serial Bridge (No sketch modification required!)
If you have flashed `iotworkingcode/iotworkingcode.ino`:
1. Connect the ESP32 to your PC via USB cable.
2. Run:
   ```bash
   python iotworkingcode/iot_serial_bridge.py --port COM3 --url http://localhost:8000
   ```
   *(Replace `COM3` with your ESP32's COM port from Device Manager)*.

---

## 📱 Android Build Instructions
1. Open Android Studio -> **Open an Existing Project** -> Select `android_app`.
2. Allow Gradle to sync.
3. Connect your Android device via USB (or select an emulator).
4. Click **Run (Shift + F10)** to install the APK directly.
5. On fall or SOS click, the app requests `CALL_PHONE` permission once and directly dials `112` or your chosen emergency contact.
