import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Activity, Thermometer, ShieldAlert, PhoneCall, Globe, Moon, Sun, 
  Building2, UserCheck, Pill, Settings, ShieldCheck, Bot, Calendar, Sparkles, 
  Menu, X, MessageSquare, AlertTriangle, CheckCircle2, ChevronRight, Server
} from 'lucide-react';

import { translations } from './utils/translations';
import { audioAlarm } from './utils/audioAlarm';

import { TriZoneBanner } from './components/TriZoneBanner';
import { YellowCareSuggestions } from './components/YellowCareSuggestions';
import { FallSOSModal } from './components/FallSOSModal';
import { PPGWaveform } from './components/PPGWaveform';
import { VitalsGauges } from './components/VitalsGauges';
import { SimulatorBar } from './components/SimulatorBar';
import { HospitalsDirectory } from './components/HospitalsDirectory';
import { DoctorsDirectory } from './components/DoctorsDirectory';
import { MedicineDatabase } from './components/MedicineDatabase';
import { GovSchemes } from './components/GovSchemes';
import { AIPrescriptionChatbot } from './components/AIPrescriptionChatbot';
import { ConsultationBookingModal } from './components/ConsultationBookingModal';
import { SOSSettingsModal } from './components/SOSSettingsModal';
import { AdminPortal } from './components/AdminPortal';
import { MedicineTracker } from './components/MedicineTracker';
import { WaterTracker } from './components/WaterTracker';
import { BreathingGuide } from './components/BreathingGuide';
import { SleepTracker } from './components/SleepTracker';
import { BmiCalculator } from './components/BmiCalculator';
import { ExportReport } from './components/ExportReport';
import { AlertsLog } from './components/AlertsLog';
import { GuardianView } from './components/GuardianView';
import { DEFAULT_MEDICINES } from './data/defaultMedicines';

const getInitialApiBase = () => {
  try {
    const saved = localStorage.getItem('smarthealth_backend_url');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(getInitialApiBase);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getInitialApiBase);
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals', 'doctors', 'hospitals', 'medicines', 'gov', 'chatbot', 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const API_BASE_URL = apiBaseUrl;
  const WS_BASE_URL = apiBaseUrl.replace(/^http/, 'ws');

  // Caregiver Remote Watch & Dose Tokens Configuration
  const [caregiverConfig, setCaregiverConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('smarthealth_caregiver_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      caregiver_name: "Ananya (Daughter)",
      email: "guardian.care@smarthealth.org",
      relationship: "Primary Guardian",
      phone: "+919811223344",
      dose_tokens: [
        { id: "TKN-101", med_name: "Dolo 650mg", dosage: "1 tab", time: "08:30 AM", meal: "After Food", taken: true },
        { id: "TKN-102", med_name: "Telma 40mg", dosage: "1 tab", time: "01:30 PM", meal: "After Lunch", taken: false },
        { id: "TKN-103", med_name: "Atorva 10mg", dosage: "1 tab", time: "09:00 PM", meal: "At Bedtime", taken: false }
      ]
    };
  });

  // Live IoT Telemetry State
  const [telemetry, setTelemetry] = useState({
    device_id: "ESP32-HARDWARE",
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
    summary_message: "All vitals are within stable physiological limits.",
    symptoms_detected: ["All parameters stable"],
    recommendations: ["Maintain healthy 2.5L hydration and light activity."],
    medicine_advice: [],
    dietary_tips: ["Balanced fresh meals with low sodium."],
    doctor_action_needed: false,
    fall_alert_active: false,
    emergency_call_required: false,
    suggested_emergency_number: "112"
  });

  const [simulatorMode, setSimulatorMode] = useState("NORMAL");
  const [isConnected, setIsConnected] = useState(false);
  const [hardwareActive, setHardwareActive] = useState(false);

  // Real Database Collections
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [medicines, setMedicines] = useState(DEFAULT_MEDICINES);
  const [govSchemes, setGovSchemes] = useState([]);
  const [sosConfig, setSosConfig] = useState({
    primary_sos_number: "+919811223344",
    primary_contact_name: "My Phone (Primary Contact)",
    alert_email: "emergency.alert@smarthealth.org",
    secondary_guardian_number: "+919811223344",
    secondary_guardian_name: "Family Guardian",
    ambulance_number: "108",
    doctor_phone: "+919876543210",
    doctor_name: "Dr. Sameer Verma",
    auto_dial_delay_seconds: 10,
    enable_sms_alert: true,
    enable_email_alert: true,
    custom_message: "🚨 EMERGENCY ALERT: Patient triggered SOS! Urgent medical assistance required."
  });
  const [alerts, setAlerts] = useState([]);
  const [waterData, setWaterData] = useState({ current_ml: 1600, target_ml: 2500, percentage: 64 });
  const [sleepData, setSleepData] = useState({ last_night_duration_hours: 7.4, sleep_score: 86, deep_sleep_hours: 2.1 });

  // Modal Controllers
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isSosSettingsOpen, setIsSosSettingsOpen] = useState(false);

  const t = translations[lang] || translations.en;
  const wsRef = useRef(null);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Fetch of Real Data from Backend
  useEffect(() => {
    fetchLatestVitals();
    fetchSOSConfig();
    fetchCaregiverConfig();
    fetchDoctors();
    fetchHospitals();
    fetchMedicines();
    fetchGovSchemes();
    fetchAlerts();
  }, []);

  // Real-time WebSocket Stream
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_BASE_URL}/ws/telemetry`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TELEMETRY_UPDATE' || data.type === 'INITIAL_SNAPSHOT') {
              if (data.telemetry) setTelemetry(data.telemetry);
              if (data.hardware_active !== undefined) setHardwareActive(data.hardware_active);
              if (data.zone_evaluation) {
                setZoneEvaluation(data.zone_evaluation);
                // MANUAL SOS: Never automatically pop up the SOS modal on telemetry
              }
            } else if (data.type === 'SOS_CANCELLED') {
              setIsSosModalOpen(false);
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connectWebSocket, 3000);
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connectWebSocket();

    const polling = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchLatestVitals();
      }
    }, 2500);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
      clearInterval(polling);
    };
  }, [apiBaseUrl]);

  // API Call Handlers
  const fetchLatestVitals = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/iot/latest`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.telemetry) setTelemetry(data.telemetry);
        if (data.hardware_active !== undefined) setHardwareActive(data.hardware_active);
        if (data.evaluation) {
          setZoneEvaluation(data.evaluation);
          // MANUAL SOS: Never automatically pop up the SOS modal on polling
        }
        if (data.sos_config) setSosConfig(data.sos_config);
        if (data.simulator_mode) setSimulatorMode(data.simulator_mode);
        setIsConnected(true);
      }
    } catch (e) {}
  };

  const fetchSOSConfig = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/sos/config`);
      if (resp.ok) setSosConfig(await resp.json());
    } catch (e) {}
  };

  const fetchDoctors = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/doctors`);
      if (resp.ok) setDoctors(await resp.json());
    } catch (e) {}
  };

  const fetchHospitals = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/hospitals`);
      if (resp.ok) setHospitals(await resp.json());
    } catch (e) {}
  };

  const fetchMedicines = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/medicines`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          setMedicines(data);
          return;
        }
      }
    } catch (e) {}
    setMedicines(DEFAULT_MEDICINES);
  };

  const fetchCaregiverConfig = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/caregiver/config`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.email) {
          setCaregiverConfig(data);
          localStorage.setItem('smarthealth_caregiver_config', JSON.stringify(data));
        }
      }
    } catch (e) {}
  };

  const handleUpdateCaregiverConfig = async (newConfig) => {
    setCaregiverConfig(newConfig);
    try {
      localStorage.setItem('smarthealth_caregiver_config', JSON.stringify(newConfig));
      await fetch(`${API_BASE_URL}/api/caregiver/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {}
  };

  const fetchGovSchemes = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/gov-schemes`);
      if (resp.ok) setGovSchemes(await resp.json());
    } catch (e) {}
  };

  const fetchAlerts = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/alerts`);
      if (resp.ok) setAlerts(await resp.json());
    } catch (e) {}
  };

  const handleSaveSOSConfig = async (updatedConfig) => {
    setSosConfig(updatedConfig);
    try {
      await fetch(`${API_BASE_URL}/api/sos/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
    } catch (e) {}
  };

  const handleSetSimulatorMode = async (mode) => {
    if (hardwareActive) return;
    setSimulatorMode(mode);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/simulator/mode?mode=${mode}`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'blocked') {
          setHardwareActive(true);
        }
      }
    } catch (e) {}
  };

  const handleTriggerFall = () => {
    if (hardwareActive) return;
    setIsSosModalOpen(true);
    audioAlarm.playSiren();
  };

  const handleCancelSOS = async () => {
    setIsSosModalOpen(false);
    audioAlarm.stopSiren();
    try {
      await fetch(`${API_BASE_URL}/api/sos/cancel`, { method: 'POST' });
    } catch (e) {}
  };

  const handleSosDispatched = async (dialNumber) => {
    try {
      await fetch(`${API_BASE_URL}/api/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: telemetry.device_id,
          trigger_type: "FALL_DETECTION",
          dial_number: dialNumber || sosConfig.primary_sos_number,
          alert_email: sosConfig.alert_email,
          patient_name: sosConfig.primary_contact_name || "Primary Patient",
          heart_rate: telemetry.heart_rate,
          temperature_c: telemetry.temperature_c,
          acceleration_g: telemetry.acceleration_g,
          latitude: telemetry.latitude,
          longitude: telemetry.longitude
        })
      });
    } catch (e) {}
  };

  // Admin CRUD hooks
  const handleAddDoctor = async (doc) => {
    const optimisticDoc = { ...doc, id: doc.id || `doc-${Date.now()}` };
    setDoctors(prev => [...prev, optimisticDoc]);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/doctors`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(optimisticDoc)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setDoctors(prev => prev.map(d => d.id === optimisticDoc.id ? saved : d));
      }
    } catch (e) {}
  };

  const handleDeleteDoctor = async (id) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    try {
      await fetch(`${API_BASE_URL}/api/doctors/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddHospital = async (hosp) => {
    const optimisticHosp = { ...hosp, id: hosp.id || `hosp-${Date.now()}` };
    setHospitals(prev => [...prev, optimisticHosp]);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/hospitals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(optimisticHosp)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setHospitals(prev => prev.map(h => h.id === optimisticHosp.id ? saved : h));
      }
    } catch (e) {}
  };

  const handleDeleteHospital = async (id) => {
    setHospitals(prev => prev.filter(h => h.id !== id));
    try {
      await fetch(`${API_BASE_URL}/api/hospitals/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddMedicine = async (med) => {
    const optimisticMed = { ...med, id: med.id || `med-${Date.now()}` };
    setMedicines(prev => [...prev, optimisticMed]);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/medicines`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(optimisticMed)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setMedicines(prev => prev.map(m => m.id === optimisticMed.id ? saved : m));
      }
    } catch (e) {}
  };

  const handleDeleteMedicine = async (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    try {
      await fetch(`${API_BASE_URL}/api/medicines/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleAddGovScheme = async (scheme) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/gov-schemes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scheme)
      });
      if (resp.ok) {
        const saved = await resp.json();
        setGovSchemes(prev => [...prev, saved]);
      }
    } catch (e) {}
  };

  const openBookingForDoctor = (doc) => {
    setSelectedDoctorForBooking(doc);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  SmartHealth
                </h1>
                <button
                  onClick={() => {
                    setServerUrlInput(apiBaseUrl);
                    setShowServerModal(true);
                  }}
                  title={lang === 'hi' ? 'सर्वर IP / URL बदलने के लिए क्लिक करें' : 'Click to configure Backend Server IP / Cloud URL'}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${hardwareActive ? 'bg-emerald-500 animate-pulse' : isConnected ? 'bg-sky-500' : 'bg-amber-500'}`}></span>
                  <span>{hardwareActive ? 'ESP32 Hardware Online' : isConnected ? 'ESP32 Ready (Default Vitals Active)' : 'Connecting...'}</span>
                  <Server className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500">
                IoT Patient Lifeline & Health Administration Hub
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'vitals' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              📊 Live Vitals
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'doctors' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              👨‍⚕️ Doctors
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'hospitals' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              🏥 Hospitals
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'medicines' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              💊 Medicines
            </button>
            <button
              onClick={() => setActiveTab('gov')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'gov' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              🏛️ Govt Schemes
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'chatbot' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              🤖 AI Doctor
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
            >
              🔐 Admin Panel
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOS Settings Button (Manage Numbers) */}
            <button
              onClick={() => setIsSosSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Manage SOS Dial Number & Settings"
            >
              <Settings className="w-4 h-4 text-red-500" />
            </button>

            {/* Direct Panic SOS Button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-transform animate-pulse"
              title="Dispatches direct SOS call & SMS intent to your phone"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS ({sosConfig.primary_sos_number || '+919811223344'})</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs font-bold animate-fade-in">
            <button
              onClick={() => { setActiveTab('vitals'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'vitals' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              📊 Live Vitals & Emergency Lifeline
            </button>
            <button
              onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'doctors' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              👨‍⚕️ Local Doctors & Specialists
            </button>
            <button
              onClick={() => { setActiveTab('hospitals'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'hospitals' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              🏥 Local Hospitals & 24/7 Emergency
            </button>
            <button
              onClick={() => { setActiveTab('medicines'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'medicines' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              💊 Medicines for Any Illness
            </button>
            <button
              onClick={() => { setActiveTab('gov'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'gov' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              🏛️ Government Health Schemes (PM-JAY, ABHA)
            </button>
            <button
              onClick={() => { setActiveTab('chatbot'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'chatbot' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              🤖 AI Doctor & Prescription Chatbot
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl ${activeTab === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-700 dark:text-slate-300'}`}
            >
              🔐 Admin Management Portal
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Core Tri-Zone Health Banner (GREEN / YELLOW / RED) */}
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
          onAddMedicine={() => {}}
          lang={lang}
          t={t}
        />

        {/* 3. Hardware Simulator Test Controls */}
        <SimulatorBar
          currentMode={simulatorMode}
          onSetMode={handleSetSimulatorMode}
          onTriggerFall={handleTriggerFall}
          hardwareActive={hardwareActive}
          lang={lang}
          t={t}
        />

        {/* Dynamic Main Workspace Tabs */}
        {activeTab === 'vitals' && (
          <>
            {/* Real-time PPG Heart Pulse Waveform (synced to MAX30102) */}
            <PPGWaveform
              bpm={telemetry.heart_rate}
              zone={zoneEvaluation.zone}
              telemetry={telemetry}
              t={t}
            />

            {/* 4 Primary IoT Telemetry Gauges */}
            <VitalsGauges
              telemetry={telemetry}
              zoneEvaluation={zoneEvaluation}
              hardwareActive={hardwareActive}
              lang={lang}
              t={t}
            />

            {/* Two Column Health Support (AI Chatbot & Water Tracker) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AIPrescriptionChatbot
                telemetry={telemetry}
                apiBaseUrl={API_BASE_URL}
                lang={lang}
              />
              <div className="space-y-6">
                <WaterTracker
                  waterData={waterData}
                  onAddWater={(amt) => setWaterData(prev => ({ ...prev, current_ml: prev.current_ml + amt }))}
                  lang={lang}
                  t={t}
                />
                <BreathingGuide
                  currentHr={telemetry.heart_rate}
                  lang={lang}
                  t={t}
                />
              </div>
            </div>

            {/* Sleep & BMI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SleepTracker sleepData={sleepData} lang={lang} t={t} />
              <BmiCalculator lang={lang} t={t} />
            </div>

            {/* Caregiver & Audit Alerts */}
            <GuardianView
              telemetry={telemetry}
              zoneEvaluation={zoneEvaluation}
              medicines={medicines}
              caregiverConfig={caregiverConfig}
              lang={lang}
              t={t}
            />
            <AlertsLog alerts={alerts} lang={lang} t={t} />
          </>
        )}

        {/* Tab 2: Doctors Directory */}
        {activeTab === 'doctors' && (
          <DoctorsDirectory
            doctors={doctors}
            onSelectDoctorForBooking={openBookingForDoctor}
            lang={lang}
          />
        )}

        {/* Tab 3: Hospitals Directory */}
        {activeTab === 'hospitals' && (
          <HospitalsDirectory
            hospitals={hospitals}
            lang={lang}
          />
        )}

        {/* Tab 4: Medicines for Any Illness */}
        {activeTab === 'medicines' && (
          <MedicineDatabase
            medicines={medicines}
            lang={lang}
          />
        )}

        {/* Tab 5: Government Health Portals & Schemes */}
        {activeTab === 'gov' && (
          <GovSchemes
            govSchemes={govSchemes}
            lang={lang}
          />
        )}

        {/* Tab 6: AI Prescription Chatbot */}
        {activeTab === 'chatbot' && (
          <AIPrescriptionChatbot
            telemetry={telemetry}
            apiBaseUrl={API_BASE_URL}
            lang={lang}
          />
        )}

        {/* Tab 7: Admin Management Portal */}
        {activeTab === 'admin' && (
          <AdminPortal
            doctors={doctors}
            hospitals={hospitals}
            medicines={medicines}
            govSchemes={govSchemes}
            caregiverConfig={caregiverConfig}
            onUpdateCaregiverConfig={handleUpdateCaregiverConfig}
            sosConfig={sosConfig}
            onUpdateSosConfig={handleSaveSOSConfig}
            onAddDoctor={handleAddDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onAddHospital={handleAddHospital}
            onDeleteHospital={handleDeleteHospital}
            onAddMedicine={handleAddMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onAddGovScheme={handleAddGovScheme}
            apiBaseUrl={API_BASE_URL}
            lang={lang}
          />
        )}
      </main>

      {/* Real-time Consultation Booking Modal with FormSubmit.co & WhatsApp */}
      <ConsultationBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={selectedDoctorForBooking}
        telemetry={telemetry}
        zoneEvaluation={zoneEvaluation}
        apiBaseUrl={API_BASE_URL}
        lang={lang}
      />

      {/* SOS Emergency Number Management Settings Modal */}
      <SOSSettingsModal
        isOpen={isSosSettingsOpen}
        onClose={() => setIsSosSettingsOpen(false)}
        sosConfig={sosConfig}
        onSaveConfig={handleSaveSOSConfig}
        lang={lang}
      />

      {/* Fall SOS Modal */}
      <FallSOSModal
        isOpen={isSosModalOpen}
        onClose={handleCancelSOS}
        telemetry={telemetry}
        sosConfig={sosConfig}
        emergencyContacts={[
          {
            is_primary: true,
            name: sosConfig.primary_contact_name || "My Emergency Contact",
            phone: sosConfig.primary_sos_number || "+919811223344",
            email: sosConfig.alert_email || "emergency.alert@smarthealth.org"
          },
          {
            is_primary: false,
            name: sosConfig.secondary_guardian_name || "Family Guardian",
            phone: sosConfig.secondary_guardian_number || "+919811223344"
          }
        ]}
        onSosDispatched={handleSosDispatched}
        lang={lang}
        t={t}
      />

      {/* Backend Server Connection Settings Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-xs">
            <button
              onClick={() => setShowServerModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {lang === 'hi' ? 'बैकएंड सर्वर कनेक्शन सेटिंग्स' : 'Backend Server Connection'}
                </h3>
                <p className="text-slate-500 text-[11px]">
                  {lang === 'hi' ? 'स्थानीय लैपटॉप IP या क्लाउड बैकएंड URL सेट करें' : 'Set Local Laptop IP or Render Cloud backend URL'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === 'hi' ? 'सर्वर API URL:' : 'Backend API URL:'}
                </label>
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="e.g. http://10.103.4.215:8000 or https://smarthealth.onrender.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[10.5px] text-slate-500">
                  {lang === 'hi'
                    ? 'वर्तमान लैपटॉप Wi-Fi IP: http://10.103.4.215:8000'
                    : 'Current Laptop Wi-Fi IP: http://10.103.4.215:8000'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const defaultUrl = 'http://localhost:8000';
                    setServerUrlInput(defaultUrl);
                    localStorage.setItem('smarthealth_backend_url', defaultUrl);
                    setApiBaseUrl(defaultUrl);
                    setShowServerModal(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {lang === 'hi' ? 'लोकलहोस्ट (Default)' : 'Reset Localhost'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentLan = 'http://10.103.4.215:8000';
                    setServerUrlInput(currentLan);
                    localStorage.setItem('smarthealth_backend_url', currentLan);
                    setApiBaseUrl(currentLan);
                    setShowServerModal(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800"
                >
                  Use 10.103.4.215
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = serverUrlInput.trim().replace(/\/+$/, '');
                    if (trimmed) {
                      localStorage.setItem('smarthealth_backend_url', trimmed);
                      setApiBaseUrl(trimmed);
                    }
                    setShowServerModal(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 text-center"
                >
                  {lang === 'hi' ? 'सेव करें एवं कनेक्ट करें' : 'Save & Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
