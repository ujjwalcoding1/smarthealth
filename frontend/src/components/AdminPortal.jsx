import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Trash2, Edit2, Check, X, Building2, UserPlus, 
  Pill, Globe, Phone, MapPin, DollarSign, Clock, AlertCircle, Search,
  Mail, Users, CheckCircle2, BedDouble, Stethoscope
} from 'lucide-react';

export function AdminPortal({ 
  doctors, hospitals, medicines, govSchemes,
  caregiverConfig, onUpdateCaregiverConfig,
  onAddDoctor, onDeleteDoctor,
  onAddHospital, onDeleteHospital,
  onAddMedicine, onDeleteMedicine,
  onAddGovScheme,
  apiBaseUrl, lang
}) {
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Caregiver form state
  const [caregiverEmailForm, setCaregiverEmailForm] = useState({
    caregiver_name: caregiverConfig?.caregiver_name || 'Ananya (Daughter)',
    email: caregiverConfig?.email || 'guardian.care@smarthealth.org',
    relationship: caregiverConfig?.relationship || 'Primary Guardian',
    phone: caregiverConfig?.phone || '+919811223344'
  });
  const [caregiverSavedToast, setCaregiverSavedToast] = useState(false);

  // New dose token form state
  const [newToken, setNewToken] = useState({
    id: `TKN-${Math.floor(100 + Math.random() * 900)}`,
    med_name: '',
    dosage: '1 tablet',
    time: '08:30 AM',
    meal: 'After Food',
    taken: false
  });

  // Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '', specialty: 'General Physician', qualification: 'MBBS, MD',
    experience_years: 10, hospital_clinic_name: '', location: '',
    phone: '', whatsapp_number: '', consultation_fee: 500,
    available_days: 'Mon - Sat', available_time: '10:00 AM - 02:00 PM',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    email: 'doctor@smarthealth.org'
  });

  // Hospital Form State
  const [newHospital, setNewHospital] = useState({
    name: '', category: 'Multi-Speciality Hospital', address: '',
    city: 'New Delhi', state: 'Delhi', emergency_phone: '', reception_phone: '',
    emergency_24x7: true, ambulance_available: true,
    total_beds: 250, icu_beds: 40,
    facilities: ['24/7 ICU', 'Oxygen Supply', 'Blood Bank', 'Pharmacy', 'Trauma Unit'],
    photo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
    google_maps_url: 'https://maps.google.com/?q=28.6139,77.2090'
  });

  // Medicine Form State
  const [newMedicine, setNewMedicine] = useState({
    brand_name: '', generic_name: '', category: 'Fever & Pain Relief',
    illness_treated: '', dosage_adult: '1 tablet after food',
    frequency: 'Twice daily', meal_instruction: 'After Food',
    precautions: 'Complete recommended course. Avoid alcohol.', side_effects: 'Mild nausea (rare)',
    prescription_required: false, price_inr: 50
  });

  // Gov Scheme Form State
  const [newGovScheme, setNewGovScheme] = useState({
    scheme_name: '', authority: 'Ministry of Health & Family Welfare',
    category: 'Healthcare Assurance', description: '', benefits: '',
    eligibility: 'All Citizens', helpline_number: '', official_portal_url: ''
  });

  // Save Caregiver Email and Info
  const handleSaveCaregiverInfo = (e) => {
    e.preventDefault();
    if (onUpdateCaregiverConfig) {
      onUpdateCaregiverConfig({
        ...caregiverConfig,
        caregiver_name: caregiverEmailForm.caregiver_name,
        email: caregiverEmailForm.email,
        relationship: caregiverEmailForm.relationship,
        phone: caregiverEmailForm.phone
      });
    }
    setCaregiverSavedToast(true);
    setTimeout(() => setCaregiverSavedToast(false), 2500);
  };

  // Add new Dose Token
  const handleAddDoseToken = (e) => {
    e.preventDefault();
    if (!newToken.med_name.trim()) return;

    const currentTokens = caregiverConfig?.dose_tokens || [];
    const updatedTokens = [...currentTokens, { ...newToken, id: newToken.id || `TKN-${Math.floor(100 + Math.random() * 900)}` }];

    if (onUpdateCaregiverConfig) {
      onUpdateCaregiverConfig({
        ...caregiverConfig,
        dose_tokens: updatedTokens
      });
    }

    setNewToken({
      id: `TKN-${Math.floor(100 + Math.random() * 900)}`,
      med_name: '',
      dosage: '1 tablet',
      time: '08:30 AM',
      meal: 'After Food',
      taken: false
    });
  };

  // Delete Dose Token
  const handleDeleteDoseToken = (tokenId) => {
    const currentTokens = caregiverConfig?.dose_tokens || [];
    const updatedTokens = currentTokens.filter(t => t.id !== tokenId);
    if (onUpdateCaregiverConfig) {
      onUpdateCaregiverConfig({
        ...caregiverConfig,
        dose_tokens: updatedTokens
      });
    }
  };

  // Toggle Dose Token taken status
  const handleToggleTokenTaken = (tokenId) => {
    const currentTokens = caregiverConfig?.dose_tokens || [];
    const updatedTokens = currentTokens.map(t => t.id === tokenId ? { ...t, taken: !t.taken } : t);
    if (onUpdateCaregiverConfig) {
      onUpdateCaregiverConfig({
        ...caregiverConfig,
        dose_tokens: updatedTokens
      });
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (activeTab === 'doctors') {
      if (onAddDoctor) onAddDoctor(newDoctor);
      setNewDoctor({
        name: '', specialty: 'General Physician', qualification: 'MBBS, MD',
        experience_years: 10, hospital_clinic_name: '', location: '',
        phone: '', whatsapp_number: '', consultation_fee: 500,
        available_days: 'Mon - Sat', available_time: '10:00 AM - 02:00 PM',
        photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        email: 'doctor@smarthealth.org'
      });
    } else if (activeTab === 'hospitals') {
      if (onAddHospital) onAddHospital(newHospital);
      setNewHospital({
        name: '', category: 'Multi-Speciality Hospital', address: '',
        city: 'New Delhi', state: 'Delhi', emergency_phone: '', reception_phone: '',
        emergency_24x7: true, ambulance_available: true,
        total_beds: 250, icu_beds: 40,
        facilities: ['24/7 ICU', 'Oxygen Supply', 'Blood Bank', 'Pharmacy', 'Trauma Unit'],
        photo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
        google_maps_url: 'https://maps.google.com/?q=28.6139,77.2090'
      });
    } else if (activeTab === 'medicines') {
      if (onAddMedicine) onAddMedicine(newMedicine);
      setNewMedicine({
        brand_name: '', generic_name: '', category: 'Fever & Pain Relief',
        illness_treated: '', dosage_adult: '1 tablet after food',
        frequency: 'Twice daily', meal_instruction: 'After Food',
        precautions: 'Complete recommended course. Avoid alcohol.', side_effects: 'Mild nausea (rare)',
        prescription_required: false, price_inr: 50
      });
    } else if (activeTab === 'govSchemes') {
      if (onAddGovScheme) onAddGovScheme(newGovScheme);
    }
    setShowAddModal(false);
  };

  const medicineCategories = [
    'Fever & Pain Relief',
    'Cardiac & BP',
    'Diabetes',
    'Antibiotic & Infection',
    'Digestive & Acidity',
    'Respiratory & Cough',
    'Allergy & Skin',
    'Vitamins & Minerals',
    'Kidney & Urinary',
    'Hormones & Thyroid'
  ];

  const doseTokensList = caregiverConfig?.dose_tokens || [];

  return (
    <div className="health-card mb-8 border-slate-700 bg-slate-900/90 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                {lang === 'hi' ? 'एडमिन प्रबंधन पोर्टल' : 'Admin Management Portal'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Authorized Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'hi' 
                ? 'केयरगिवर ईमेल, दवा टोकन, स्थानीय अस्पताल, डॉक्टर एवं दवाइयाँ प्रबंधित करें।'
                : 'Configure Caregiver Email, Dose Tokens, Local Hospitals, Doctors & Illness Medications.'}
            </p>
          </div>
        </div>

        {activeTab !== 'caregiver' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>
              Add New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'hospitals' ? 'Hospital' : activeTab === 'medicines' ? 'Medicine' : 'Gov Scheme'}
            </span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('doctors'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'doctors' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Doctors ({doctors?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('hospitals'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'hospitals' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hospitals & Clinics ({hospitals?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('medicines'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'medicines' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Medicines Catalog ({medicines?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('caregiver'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'caregiver' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Caregiver & Dose Tokens</span>
        </button>

        <button
          onClick={() => { setActiveTab('govSchemes'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'govSchemes' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Govt Portals ({govSchemes?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: CAREGIVER REMOTE WATCH & DOSE TOKENS CONFIGURATION */}
      {activeTab === 'caregiver' && (
        <div className="space-y-6">
          {caregiverSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Caregiver Email & Profile successfully updated! Remote Watch is now synchronized.</span>
            </div>
          )}

          {/* Part A: Caregiver Alert Email & Details Form */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
              <Mail className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">
                Caregiver Alert Email Configuration (Replaces Primary Contact)
              </h4>
            </div>
            <p className="text-slate-400 mb-4 text-[11px]">
              Set the primary caregiver's email address below. When vital alarms occur or when requested from the Caregiver Remote Watch panel, structured patient health reports and medicine compliance data will be sent directly to this email.
            </p>

            <form onSubmit={handleSaveCaregiverInfo} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caregiver Full Name</label>
                <input
                  type="text" required placeholder="e.g. Ananya Sharma"
                  value={caregiverEmailForm.caregiver_name}
                  onChange={e => setCaregiverEmailForm({ ...caregiverEmailForm, caregiver_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caregiver Alert Email Address (Primary)</label>
                <input
                  type="email" required placeholder="e.g. guardian.family@gmail.com"
                  value={caregiverEmailForm.email}
                  onChange={e => setCaregiverEmailForm({ ...caregiverEmailForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-indigo-500 text-white font-mono focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relationship to Patient</label>
                <input
                  type="text" placeholder="e.g. Daughter / Son / Spouse / Primary Guardian"
                  value={caregiverEmailForm.relationship}
                  onChange={e => setCaregiverEmailForm({ ...caregiverEmailForm, relationship: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Backup Contact Phone</label>
                <input
                  type="tel" placeholder="+91 9811223344"
                  value={caregiverEmailForm.phone}
                  onChange={e => setCaregiverEmailForm({ ...caregiverEmailForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Caregiver Email & Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Part B: Medicine Dose Tokens Manager */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  Medicine Dose Tokens Management ({doseTokensList.length} Active Tokens)
                </h4>
              </div>
            </div>

            {/* Form to Add New Dose Token */}
            <form onSubmit={handleAddDoseToken} className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 mb-4 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Token ID</label>
                <input
                  type="text" required
                  value={newToken.id}
                  onChange={e => setNewToken({ ...newToken, id: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Medicine Name</label>
                <input
                  type="text" required placeholder="e.g. Pan-D 40mg"
                  value={newToken.med_name}
                  onChange={e => setNewToken({ ...newToken, med_name: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Dosage & Meal</label>
                <input
                  type="text" placeholder="1 tab • After Food"
                  value={`${newToken.dosage} • ${newToken.meal}`}
                  onChange={e => setNewToken({ ...newToken, dosage: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Scheduled Time</label>
                <input
                  type="text" placeholder="08:30 AM"
                  value={newToken.time}
                  onChange={e => setNewToken({ ...newToken, time: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Token</span>
              </button>
            </form>

            {/* List of Active Tokens */}
            <div className="space-y-2">
              {doseTokensList.map((token) => (
                <div
                  key={token.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {token.id}
                    </span>
                    <div>
                      <strong className="text-white text-sm block">{token.med_name}</strong>
                      <span className="text-slate-400 text-[11px]">{token.dosage} • {token.meal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300 text-xs">⏰ {token.time}</span>
                    <button
                      onClick={() => handleToggleTokenTaken(token.id)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all ${
                        token.taken 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                      }`}
                    >
                      {token.taken ? '✓ Taken' : '○ Scheduled'}
                    </button>
                    <button
                      onClick={() => handleDeleteDoseToken(token.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors"
                      title="Remove Token"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {doctors?.map((doc) => (
            <div key={doc.id} className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start gap-3">
              <img
                src={doc.photo_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200"}
                alt={doc.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-600 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-sm text-white truncate">{doc.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">₹{doc.consultation_fee}</span>
                </div>
                <p className="text-indigo-400 font-medium truncate">{doc.specialty}</p>
                <p className="text-slate-400 text-[11px] truncate">{doc.hospital_clinic_name} • {doc.location}</p>
                <p className="text-slate-500 text-[10px] font-mono mt-1">📞 {doc.phone} | WA: {doc.whatsapp_number}</p>
              </div>
              <button
                onClick={() => onDeleteDoctor && onDeleteDoctor(doc.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors flex-shrink-0"
                title="Delete Doctor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: HOSPITALS & CLINICS DIRECTORY */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {hospitals?.map((hosp) => (
            <div key={hosp.id} className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start gap-3">
              <img
                src={hosp.photo_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=200"}
                alt={hosp.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-600 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-sm text-white truncate">{hosp.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold">24x7 Emergency</span>
                </div>
                <p className="text-slate-400 text-[11px] truncate">{hosp.address}, {hosp.city}</p>
                <p className="text-slate-400 text-[11px] font-mono mt-1">📞 Emergency: {hosp.emergency_phone}</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {hosp.facilities?.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDeleteHospital && onDeleteHospital(hosp.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors flex-shrink-0"
                title="Delete Hospital"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MEDICINES FOR ALL ILLNESSES */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {medicines?.map((med) => (
            <div key={med.id} className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start justify-between gap-3 text-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-sm text-white truncate">{med.brand_name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono font-bold">₹{med.price_inr}</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">{med.category}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-mono mb-1 truncate">{med.generic_name}</p>
                <p className="text-emerald-400 text-[11px] mb-1"><strong>Treats:</strong> {med.illness_treated}</p>
                <p className="text-slate-400 text-[10px]"><strong>Dose:</strong> {med.dosage_adult} ({med.meal_instruction})</p>
              </div>
              <button
                onClick={() => onDeleteMedicine && onDeleteMedicine(med.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors flex-shrink-0"
                title="Delete Medicine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: GOVT SCHEMES */}
      {activeTab === 'govSchemes' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {govSchemes?.map((scheme) => (
            <div key={scheme.id} className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-white">{scheme.scheme_name}</h4>
                <a
                  href={scheme.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 text-[11px] font-semibold hover:underline"
                >
                  Visit Portal →
                </a>
              </div>
              <span className="text-indigo-400 text-[11px] font-medium block mb-1">{scheme.category}</span>
              <p className="text-slate-300 text-[11px] mb-2">{scheme.description}</p>
              <div className="flex items-center gap-3 text-[10.5px] text-slate-400 font-mono">
                <span>📞 Helpline: {scheme.helpline_number}</span>
                <span>Authority: {scheme.authority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOR ADDING DOCTOR / HOSPITAL / MEDICINE / GOV SCHEME */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-bold text-sm text-white">
                Add New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'hospitals' ? 'Local Hospital / Clinic' : activeTab === 'medicines' ? 'Medicine for Illness' : 'Government Health Scheme'}
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              {/* Doctor Form */}
              {activeTab === 'doctors' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Doctor Full Name</label>
                    <input
                      type="text" required placeholder="e.g. Dr. Rajesh Sharma"
                      value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Specialty</label>
                      <input
                        type="text" required placeholder="e.g. Cardiologist / Neurologist"
                        value={newDoctor.specialty} onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Qualifications</label>
                      <input
                        type="text" placeholder="MBBS, MD, DM"
                        value={newDoctor.qualification} onChange={e => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                      <input
                        type="tel" required placeholder="+91 9876543210"
                        value={newDoctor.phone} onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">WhatsApp Number</label>
                      <input
                        type="tel" required placeholder="919876543210"
                        value={newDoctor.whatsapp_number} onChange={e => setNewDoctor({ ...newDoctor, whatsapp_number: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Hospital / Clinic Name & Location</label>
                    <input
                      type="text" required placeholder="e.g. Max Hospital, Saket, Delhi"
                      value={newDoctor.hospital_clinic_name} onChange={e => setNewDoctor({ ...newDoctor, hospital_clinic_name: e.target.value, location: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Consultation Fee (₹)</label>
                      <input
                        type="number" required placeholder="500"
                        value={newDoctor.consultation_fee} onChange={e => setNewDoctor({ ...newDoctor, consultation_fee: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Photo URL</label>
                      <input
                        type="url" placeholder="https://..."
                        value={newDoctor.photo_url} onChange={e => setNewDoctor({ ...newDoctor, photo_url: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Hospital Form - Enhanced with full fields */}
              {activeTab === 'hospitals' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Hospital / Clinic Name</label>
                    <input
                      type="text" required placeholder="e.g. Fortis Escorts Hospital / City Care Clinic"
                      value={newHospital.name} onChange={e => setNewHospital({ ...newHospital, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Hospital Category</label>
                      <select
                        value={newHospital.category} onChange={e => setNewHospital({ ...newHospital, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      >
                        <option>Multi-Speciality Hospital</option>
                        <option>Trauma & Emergency Center</option>
                        <option>Dedicated Cardiac Care</option>
                        <option>Mother & Child Hospital</option>
                        <option>Government District Hospital</option>
                        <option>Local Primary Health Clinic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">City & State</label>
                      <input
                        type="text" required placeholder="e.g. New Delhi, Delhi"
                        value={newHospital.city} onChange={e => setNewHospital({ ...newHospital, city: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Full Physical Address</label>
                    <input
                      type="text" required placeholder="e.g. Plot 1, Institutional Area, Sector 62"
                      value={newHospital.address} onChange={e => setNewHospital({ ...newHospital, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">24x7 Emergency Helpline Phone</label>
                      <input
                        type="tel" required placeholder="108 / +91-11-26515050"
                        value={newHospital.emergency_phone} onChange={e => setNewHospital({ ...newHospital, emergency_phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">General Reception Phone</label>
                      <input
                        type="tel" placeholder="+91-11-66115050"
                        value={newHospital.reception_phone} onChange={e => setNewHospital({ ...newHospital, reception_phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Total Bed Capacity</label>
                      <input
                        type="number" placeholder="250"
                        value={newHospital.total_beds} onChange={e => setNewHospital({ ...newHospital, total_beds: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">ICU Beds Count</label>
                      <input
                        type="number" placeholder="40"
                        value={newHospital.icu_beds} onChange={e => setNewHospital({ ...newHospital, icu_beds: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Hospital Photo URL</label>
                    <input
                      type="url" placeholder="https://images.unsplash.com/..."
                      value={newHospital.photo_url} onChange={e => setNewHospital({ ...newHospital, photo_url: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Google Maps Direction Link</label>
                    <input
                      type="url" placeholder="https://maps.google.com/?q=..."
                      value={newHospital.google_maps_url} onChange={e => setNewHospital({ ...newHospital, google_maps_url: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Medicine Form - Enhanced for Any Illness */}
              {activeTab === 'medicines' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Brand Name</label>
                      <input
                        type="text" required placeholder="e.g. Dolo 650 / Pan-D"
                        value={newMedicine.brand_name} onChange={e => setNewMedicine({ ...newMedicine, brand_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Active Generic Composition</label>
                      <input
                        type="text" required placeholder="e.g. Paracetamol 650mg"
                        value={newMedicine.generic_name} onChange={e => setNewMedicine({ ...newMedicine, generic_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                      <select
                        value={newMedicine.category} onChange={e => setNewMedicine({ ...newMedicine, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      >
                        {medicineCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Price (INR ₹)</label>
                      <input
                        type="number" required placeholder="45"
                        value={newMedicine.price_inr} onChange={e => setNewMedicine({ ...newMedicine, price_inr: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Illness / Condition Treated</label>
                    <input
                      type="text" required placeholder="e.g. High Fever, Headache, Dengue Body Ache, Migraine"
                      value={newMedicine.illness_treated} onChange={e => setNewMedicine({ ...newMedicine, illness_treated: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Adult Dosage</label>
                      <input
                        type="text" required placeholder="1 tablet after food"
                        value={newMedicine.dosage_adult} onChange={e => setNewMedicine({ ...newMedicine, dosage_adult: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Meal Timing</label>
                      <select
                        value={newMedicine.meal_instruction} onChange={e => setNewMedicine({ ...newMedicine, meal_instruction: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      >
                        <option>After Food</option>
                        <option>Before Breakfast (Empty Stomach)</option>
                        <option>With Meals</option>
                        <option>At Bedtime</option>
                        <option>SOS / As Needed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Clinical Precautions</label>
                    <input
                      type="text" placeholder="Do not exceed maximum daily dose. Avoid alcohol."
                      value={newMedicine.precautions} onChange={e => setNewMedicine({ ...newMedicine, precautions: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Gov Scheme Form */}
              {activeTab === 'govSchemes' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Scheme Name</label>
                    <input
                      type="text" required placeholder="e.g. Ayushman Bharat PM-JAY"
                      value={newGovScheme.scheme_name} onChange={e => setNewGovScheme({ ...newGovScheme, scheme_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Benefits & Coverage</label>
                    <input
                      type="text" required placeholder="₹5 Lakhs cashless hospitalization per family"
                      value={newGovScheme.benefits} onChange={e => setNewGovScheme({ ...newGovScheme, benefits: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Helpline Toll-Free</label>
                      <input
                        type="text" placeholder="14555"
                        value={newGovScheme.helpline_number} onChange={e => setNewGovScheme({ ...newGovScheme, helpline_number: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Official Portal URL</label>
                      <input
                        type="url" placeholder="https://pmjay.gov.in"
                        value={newGovScheme.official_portal_url} onChange={e => setNewGovScheme({ ...newGovScheme, official_portal_url: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-transform active:scale-95"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
