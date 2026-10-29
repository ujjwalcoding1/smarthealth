import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Trash2, Edit2, Check, X, Building2, UserPlus, 
  Pill, Globe, Phone, MapPin, DollarSign, Clock, AlertCircle, Search
} from 'lucide-react';

export function AdminPortal({ 
  doctors, hospitals, medicines, govSchemes,
  onAddDoctor, onDeleteDoctor,
  onAddHospital, onDeleteHospital,
  onAddMedicine, onDeleteMedicine,
  onAddGovScheme,
  apiBaseUrl
}) {
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newDoctor, setNewDoctor] = useState({
    name: '', specialty: 'General Physician', qualification: 'MBBS, MD',
    experience_years: 10, hospital_clinic_name: '', location: '',
    phone: '', whatsapp_number: '', consultation_fee: 500,
    available_days: 'Mon - Sat', available_time: '10:00 AM - 02:00 PM',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    email: 'doctor@smarthealth.org'
  });

  const [newHospital, setNewHospital] = useState({
    name: '', category: 'Multi-Speciality Hospital', address: '',
    city: 'New Delhi', state: 'Delhi', emergency_phone: '', reception_phone: '',
    emergency_24x7: true, ambulance_available: true,
    facilities: ['24/7 ICU', 'Oxygen Supply', 'Blood Bank', 'Pharmacy'],
    photo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
    google_maps_url: 'https://maps.google.com/?q=28.6139,77.2090'
  });

  const [newMedicine, setNewMedicine] = useState({
    brand_name: '', generic_name: '', category: 'Fever & Pain Relief',
    illness_treated: '', dosage_adult: '1 tablet after food',
    frequency: 'Twice daily', meal_instruction: 'After Food',
    precautions: '', side_effects: 'Mild nausea (rare)',
    prescription_required: false, price_inr: 50
  });

  const [newGovScheme, setNewGovScheme] = useState({
    scheme_name: '', authority: 'Ministry of Health & Family Welfare',
    category: 'Healthcare Assurance', description: '', benefits: '',
    eligibility: 'All Citizens', helpline_number: '', official_portal_url: ''
  });

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (activeTab === 'doctors') {
      if (onAddDoctor) onAddDoctor(newDoctor);
    } else if (activeTab === 'hospitals') {
      if (onAddHospital) onAddHospital(newHospital);
    } else if (activeTab === 'medicines') {
      if (onAddMedicine) onAddMedicine(newMedicine);
    } else if (activeTab === 'govSchemes') {
      if (onAddGovScheme) onAddGovScheme(newGovScheme);
    }
    setShowAddModal(false);
  };

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
                Admin Management Portal
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage verified local doctors, hospitals, pharmacies & government health schemes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'hospitals' ? 'Hospital' : activeTab === 'medicines' ? 'Medicine' : 'Gov Scheme'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('doctors'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'doctors' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Doctors ({doctors?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('hospitals'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'hospitals' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hospitals & Clinics ({hospitals?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('medicines'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'medicines' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Medicines for Illnesses ({medicines?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('govSchemes'); setSearchQuery(''); }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'govSchemes' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Govt Portals ({govSchemes?.length || 0})</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {/* 1. Doctors Tab */}
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
                <p className="text-slate-500 text-[10px] font-mono mt-1">Phone: {doc.phone} | WA: {doc.whatsapp_number}</p>
              </div>
              <button
                onClick={() => onDeleteDoctor && onDeleteDoctor(doc.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors"
                title="Delete Doctor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Hospitals Tab */}
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
                <p className="text-slate-400 text-[11px] font-mono mt-1">📞 {hosp.emergency_phone}</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {hosp.facilities?.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDeleteHospital && onDeleteHospital(hosp.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors"
                title="Delete Hospital"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Medicines Tab */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {medicines?.map((med) => (
            <div key={med.id} className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start justify-between gap-3 text-xs">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{med.brand_name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono font-bold">₹{med.price_inr}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-mono mb-1">{med.generic_name}</p>
                <p className="text-emerald-400 text-[11px]"><strong>Treats:</strong> {med.illness_treated}</p>
                <p className="text-slate-400 text-[10px]"><strong>Dose:</strong> {med.dosage_adult} ({med.meal_instruction})</p>
              </div>
              <button
                onClick={() => onDeleteMedicine && onDeleteMedicine(med.id)}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors"
                title="Delete Medicine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Gov Schemes Tab */}
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

      {/* Modal for Adding New Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-bold text-sm text-white">
                Add New {activeTab === 'doctors' ? 'Doctor' : activeTab === 'hospitals' ? 'Hospital / Clinic' : activeTab === 'medicines' ? 'Medicine' : 'Government Scheme'}
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

              {/* Hospital Form */}
              {activeTab === 'hospitals' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Hospital / Clinic Name</label>
                    <input
                      type="text" required placeholder="e.g. Apollo Multi-Speciality Hospital"
                      value={newHospital.name} onChange={e => setNewHospital({ ...newHospital, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Full Address & City</label>
                    <input
                      type="text" required placeholder="e.g. Ring Road, Sarita Vihar, New Delhi"
                      value={newHospital.address} onChange={e => setNewHospital({ ...newHospital, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Emergency Phone</label>
                      <input
                        type="tel" required placeholder="108 / +91-11-26515050"
                        value={newHospital.emergency_phone} onChange={e => setNewHospital({ ...newHospital, emergency_phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Reception Phone</label>
                      <input
                        type="tel" placeholder="+91-11-66115050"
                        value={newHospital.reception_phone} onChange={e => setNewHospital({ ...newHospital, reception_phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Google Maps Link</label>
                    <input
                      type="url" placeholder="https://maps.google.com/..."
                      value={newHospital.google_maps_url} onChange={e => setNewHospital({ ...newHospital, google_maps_url: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Medicine Form */}
              {activeTab === 'medicines' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Brand Name</label>
                      <input
                        type="text" required placeholder="e.g. Dolo 650"
                        value={newMedicine.brand_name} onChange={e => setNewMedicine({ ...newMedicine, brand_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Generic Name</label>
                      <input
                        type="text" required placeholder="Paracetamol 650mg"
                        value={newMedicine.generic_name} onChange={e => setNewMedicine({ ...newMedicine, generic_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Illness / Symptoms Treated</label>
                    <input
                      type="text" required placeholder="e.g. Fever, Headache, Body Ache, Influenza"
                      value={newMedicine.illness_treated} onChange={e => setNewMedicine({ ...newMedicine, illness_treated: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Dosage (Adults)</label>
                      <input
                        type="text" placeholder="1 tablet after meals"
                        value={newMedicine.dosage_adult} onChange={e => setNewMedicine({ ...newMedicine, dosage_adult: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Price (₹)</label>
                      <input
                        type="number" placeholder="30"
                        value={newMedicine.price_inr} onChange={e => setNewMedicine({ ...newMedicine, price_inr: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
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
