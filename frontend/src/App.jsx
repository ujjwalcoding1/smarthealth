import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Activity, Thermometer, ShieldAlert, PhoneCall, Globe, Moon, Sun, 
  User, CheckCircle2, AlertTriangle, Pill, Calendar, FileText, Droplet, 
  Wind, Clock, Sparkles, RefreshCw, Volume2, VolumeX, Radio
} from 'lucide-react';

import { translations } from './utils/translations';
import { audioAlarm } from './utils/audioAlarm';

import { TriZoneBanner } from './components/TriZoneBanner';
import { YellowCareSuggestions } from './components/YellowCareSuggestions';
import { FallSOSModal } from './components/FallSOSModal';
import { PPGWaveform } from './components/PPGWaveform';
import { VitalsGauges } from './components/VitalsGauges';
import { SimulatorBar } from './components/SimulatorBar';
import { AIAssistant } from './components/AIAssistant';
import { MedicineTracker } from './components/MedicineTracker';
import { EmergencyContacts } from './components/EmergencyContacts';
import { WaterTracker } from './components/WaterTracker';
import { OrganHealth } from './components/OrganHealth';
import { Appointments } from './components/Appointments';
import { LabReports } from './components/LabReports';
import { BreathingGuide } from './components/BreathingGuide';
import { SleepTracker } from './components/SleepTracker';
import { BmiCalculator } from './components/BmiCalculator';
import { ExportReport } from './components/ExportReport';
import { AlertsLog } from './components/AlertsLog';
import { GuardianView } from './components/GuardianView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export function App() {
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [telemetry, setTelemetry] = useState({
    device_id: "ESP32-PATIENT-01",
    heart_rate: 74.0,
    spo2: 98.4,
    temperature_c: 36.7,
    acceleration_g: 0.99,
    ax: 0.02, ay: -0.04, az: 0.99,
    impact_detected: false,
    latitude: 28.6139,
    longitude: 77.2090,
    satellites: 8,
    gps_valid: true
  });
  const [zoneEvaluation, setZoneEvaluation] = useState({
    zone: "GREEN",
    zone_label: "NORMAL & HEALTHY",
    status_code: 0,
    severity_level: "Optimal",
    summary_message: "All vitals (Heart Rate, SpO2, Body Temp, Movement) are in the healthy target range.",
    symptoms_detected: ["All parameters stable"],
    recommendations: ["Maintain routine hydration (2-3L) and walking."],
    medicine_advice: [],
    dietary_tips: ["Antioxidant-rich fresh fruits and balanced vegetables."],
    doctor_action_needed: false,
    fall_alert_active: false,
    emergency_call_required: false,
    suggested_emergency_number: "112"
  });
  const [simulatorMode, setSimulatorMode] = useState("NORMAL");
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // App Data states
  const [medicines, setMedicines] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [waterData, setWaterData] = useState({ current_ml: 1600, target_ml: 2500, percentage: 64 });
  const [organData, setOrganData] = useState(null);
  const [diseaseRisk, setDiseaseRisk] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);

  const t = translations[lang] || translations.en;
  const wsRef = useRef(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Fetch of Data
  useEffect(() => {
    fetchLatestVitals();
    fetchMedicines();
    fetchContacts();
    fetchAppointments();
    fetchLabReports();
    fetchWater();
    fetchOrganHealth();
    fetchDiseaseRisk();
    fetchSleep();
    fetchAlerts();
    fetchProfile();
  }, []);

  // WebSocket Live Stream Connection
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_BASE_URL}/ws/telemetry`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[WS] Connected to SmartHealth backend live stream");
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TELEMETRY_UPDATE' || data.type === 'INITIAL_SNAPSHOT') {
              if (data.telemetry) setTelemetry(data.telemetry);
              if (data.zone_evaluation) {
                setZoneEvaluation(data.zone_evaluation);
                // Trigger fall modal if critical fall detected
                if (data.zone_evaluation.fall_alert_active || data.telemetry?.impact_detected) {
                  setIsSosModalOpen(true);
                }
              }
            } else if (data.type === 'SOS_ALERT') {
              setIsSosModalOpen(true);
            } else if (data.type === 'SOS_CANCELLED') {
              setIsSosModalOpen(false);
            }
          } catch (e) {
            console.error("WS parse error", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    // Fallback polling every 2s if WS disconnected
    const pollingInterval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchLatestVitals();
      }
    }, 2000);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
      clearInterval(pollingInterval);
    };
  }, []);

  // API Methods
  const fetchLatestVitals = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/iot/latest`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.telemetry) setTelemetry(data.telemetry);
        if (data.evaluation) {
          setZoneEvaluation(data.evaluation);
          if (data.evaluation.fall_alert_active || data.telemetry?.impact_detected) {
            setIsSosModalOpen(true);
          }
        }
        if (data.simulator_mode) setSimulatorMode(data.simulator_mode);
        setIsConnected(true);
      }
    } catch (err) {
      // Offline/isolated mode - keep running smoothly
    }
  };

  const fetchMedicines = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/medicines`);
      if (resp.ok) setMedicines(await resp.json());
    } catch (e) {}
  };

  const fetchContacts = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/contacts`);
      if (resp.ok) setContacts(await resp.json());
    } catch (e) {}
  };

  const fetchAppointments = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/appointments`);
      if (resp.ok) setAppointments(await resp.json());
    } catch (e) {}
  };

  const fetchLabReports = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/lab-reports`);
      if (resp.ok) setLabReports(await resp.json());
    } catch (e) {}
  };

  const fetchWater = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/water-intake`);
      if (resp.ok) setWaterData(await resp.json());
    } catch (e) {}
  };

  const fetchOrganHealth = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/health-index`);
      if (resp.ok) setOrganData(await resp.json());
    } catch (e) {}
  };

  const fetchDiseaseRisk = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/disease-risk`);
      if (resp.ok) setDiseaseRisk(await resp.json());
    } catch (e) {}
  };

  const fetchSleep = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/sleep-analysis`);
      if (resp.ok) setSleepData(await resp.json());
    } catch (e) {}
  };

  const fetchAlerts = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/alerts`);
      if (resp.ok) setAlerts(await resp.json());
    } catch (e) {}
  };

  const fetchProfile = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/patient-profile`);
      if (resp.ok) setPatientProfile(await resp.json());
    } catch (e) {}
  };

  const handleSetSimulatorMode = async (mode) => {
    setSimulatorMode(mode);
    try {
      await fetch(`${API_BASE_URL}/api/simulator/mode?mode=${mode}`, { method: 'POST' });
    } catch (e) {}
  };

  const handleTriggerFall = () => {
    setIsSosModalOpen(true);
    audioAlarm.playSiren();
  };

  const handleToggleMedicine = async (medId, taken) => {
    setMedicines(prev => prev.map(m => m.id === medId ? { ...m, taken_today: taken } : m));
    try {
      await fetch(`${API_BASE_URL}/api/medicines/${medId}/toggle?taken=${taken}`, { method: 'PUT' });
    } catch (e) {}
  };

  const handleAddMedicine = async (newMed) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setMedicines(prev => [...prev, saved]);
      }
    } catch (e) {
      setMedicines(prev => [...prev, { ...newMed, id: 'm-' + Date.now() }]);
    }
  };

  const handleAddContact = async (contact) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setContacts(prev => [...prev, saved]);
      }
    } catch (e) {
      setContacts(prev => [...prev, { ...contact, id: 'c-' + Date.now() }]);
    }
  };

  const handleAddWater = async (amount) => {
    setWaterData(prev => {
      const newAmt = prev.current_ml + amount;
      return {
        ...prev,
        current_ml: newAmt,
        percentage: Math.min(100, Math.round((newAmt / prev.target_ml) * 100))
      };
    });
    try {
      await fetch(`${API_BASE_URL}/api/water-intake?amount_ml=${amount}`, { method: 'POST' });
    } catch (e) {}
  };

  const handleBookAppointment = async (apt) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apt)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setAppointments(prev => [...prev, saved]);
      }
    } catch (e) {
      setAppointments(prev => [...prev, { ...apt, id: 'apt-' + Date.now() }]);
    }
  };

  const handleAddReport = async (rep) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/lab-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rep)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setLabReports(prev => [...prev, saved]);
      }
    } catch (e) {
      setLabReports(prev => [...prev, { ...rep, id: 'rep-' + Date.now() }]);
    }
  };

  const handleSosDispatched = async (dialNumber) => {
    try {
      await fetch(`${API_BASE_URL}/api/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: telemetry.device_id,
          patient_name: patientProfile?.name || "Rajesh Sharma",
          trigger_type: "FALL_DETECTION",
          heart_rate: telemetry.heart_rate,
          spo2: telemetry.spo2,
          temperature_c: telemetry.temperature_c,
          acceleration_g: telemetry.acceleration_g,
          latitude: telemetry.latitude,
          longitude: telemetry.longitude,
          dial_number: dialNumber
        })
      });
    } catch (e) {}
  };

  const handleCancelSOS = async () => {
    setIsSosModalOpen(false);
    audioAlarm.stopSiren();
    try {
      await fetch(`${API_BASE_URL}/api/sos/cancel`, { method: 'POST' });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {isConnected ? 'ESP32 Online' : 'Connecting...'}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions (Panic, Lang, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct SOS Panic Button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-transform active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
              title="Toggle English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Core Tri-Color Health Status Banner (GREEN / YELLOW / RED) */}
        <TriZoneBanner
          evaluation={zoneEvaluation}
          telemetry={telemetry}
          onOpenSOS={() => setIsSosModalOpen(true)}
          lang={lang}
          t={t}
        />

        {/* 2. Yellow Zone Smart Suggestions & Medicine Guidance Card */}
        <YellowCareSuggestions
          evaluation={zoneEvaluation}
          onAddMedicine={handleAddMedicine}
          lang={lang}
          t={t}
        />

        {/* 3. Hardware Simulator Testing Bar */}
        <SimulatorBar
          currentMode={simulatorMode}
          onSetMode={handleSetSimulatorMode}
          onTriggerFall={handleTriggerFall}
          lang={lang}
          t={t}
        />

        {/* 4. Real-time PPG Heart Pulse Waveform (synced to MAX30102 BPM) */}
        <PPGWaveform
          bpm={telemetry.heart_rate}
          zone={zoneEvaluation.zone}
          t={t}
        />

        {/* 5. 4 Primary IoT Telemetry Gauges (Heart Rate, SpO2, Temp, Accel & GPS) */}
        <VitalsGauges
          telemetry={telemetry}
          zoneEvaluation={zoneEvaluation}
          lang={lang}
          t={t}
        />

        {/* 6. Two-Column Workspace (AI Assistant & Medicine Timetable) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIAssistant
            telemetry={telemetry}
            lang={lang}
            t={t}
            apiBaseUrl={API_BASE_URL}
          />

          <MedicineTracker
            medicines={medicines}
            onToggleTaken={handleToggleMedicine}
            onAddMedicine={handleAddMedicine}
            lang={lang}
            t={t}
          />
        </div>

        {/* 7. Emergency Contacts & 1-Click Dialing */}
        <EmergencyContacts
          contacts={contacts}
          onAddContact={handleAddContact}
          onTriggerManualSOS={() => setIsSosModalOpen(true)}
          telemetry={telemetry}
          lang={lang}
          t={t}
        />

        {/* 8. Hydration Tracker & Breathing Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WaterTracker
            waterData={waterData}
            onAddWater={handleAddWater}
            lang={lang}
            t={t}
          />

          <BreathingGuide
            currentHr={telemetry.heart_rate}
            lang={lang}
            t={t}
          />
        </div>

        {/* 9. Comprehensive Organ Health Index & 10-Year Disease Risk */}
        <OrganHealth
          organData={organData}
          diseaseRisk={diseaseRisk}
          lang={lang}
          t={t}
        />

        {/* 10. Doctor Appointments & Teleconsultation Video Room */}
        <Appointments
          appointments={appointments}
          onBookAppointment={handleBookAppointment}
          telemetry={telemetry}
          lang={lang}
          t={t}
        />

        {/* 11. Pathology & Lab Diagnostic Reports Vault */}
        <LabReports
          labReports={labReports}
          onAddReport={handleAddReport}
          lang={lang}
          t={t}
        />

        {/* 12. Sleep Quality & BMI Body Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SleepTracker
            sleepData={sleepData}
            lang={lang}
            t={t}
          />

          <BmiCalculator
            lang={lang}
            t={t}
          />
        </div>

        {/* 13. Family Guardian View */}
        <GuardianView
          telemetry={telemetry}
          zoneEvaluation={zoneEvaluation}
          medicines={medicines}
          lang={lang}
          t={t}
        />

        {/* 14. Exportable Clinical Health Report */}
        <ExportReport
          telemetry={telemetry}
          zoneEvaluation={zoneEvaluation}
          medicines={medicines}
          labReports={labReports}
          patientProfile={patientProfile}
          lang={lang}
          t={t}
        />

        {/* 15. Alert Incident History Log */}
        <AlertsLog
          alerts={alerts}
          lang={lang}
          t={t}
        />
      </main>

      {/* Fall Detection & Emergency SOS Modal */}
      <FallSOSModal
        isOpen={isSosModalOpen}
        onClose={handleCancelSOS}
        telemetry={telemetry}
        emergencyContacts={contacts}
        onSosDispatched={handleSosDispatched}
        lang={lang}
        t={t}
      />
    </div>
  );
}

export default App;
