import React, { useState } from 'react';
import { Calendar, Video, Clock, MapPin, User, Plus, X, Mic, MicOff, VideoOff, PhoneOff, CheckCircle } from 'lucide-react';

export function Appointments({ appointments, onBookAppointment, telemetry, lang, t }) {
  const [activeCallApt, setActiveCallApt] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [newApt, setNewApt] = useState({
    doctor_name: 'Dr. Sameer Verma, MD, DM',
    specialty: 'Cardiology',
    hospital: 'Max Super Speciality Hospital, New Delhi',
    date: 'Tomorrow, 02:00 PM',
    time: '02:00 PM',
    mode: 'Teleconsultation',
    consultation_notes: 'Discussion of sensor heart rate trends and blood pressure.'
  });

  const handleBook = (e) => {
    e.preventDefault();
    if (onBookAppointment) {
      onBookAppointment(newApt);
    }
    setShowBookModal(false);
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-600 text-white shadow-sm">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.appointments}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'चिकित्सक परामर्श एवं टेलीमेडिसिन वीडियो कॉल' : 'Specialist consultations & live telehealth portal'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.bookSlot}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {appointments && appointments.map((apt) => (
          <div
            key={apt.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {apt.doctor_name}
                </span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-semibold px-2 py-0.5 rounded">
                  {apt.mode}
                </span>
              </div>
              <span className="text-xs text-sky-700 dark:text-sky-400 font-medium block">
                {apt.specialty}
              </span>
              <span className="text-xs text-slate-500 block mb-2">
                {apt.hospital}
              </span>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {apt.date}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              {apt.mode === 'Teleconsultation' ? (
                <button
                  onClick={() => setActiveCallApt(apt)}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'वीडियो कॉल शुरू करें' : 'Start Video Call'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirmed for Hospital Visit</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Telemedicine Video Call Modal */}
      {activeCallApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="p-4 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="font-bold text-sm">
                  Live Telehealth: {activeCallApt.doctor_name}
                </span>
              </div>
              <button
                onClick={() => setActiveCallApt(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative bg-slate-950 h-72 sm:h-80 flex items-center justify-center overflow-hidden">
              {/* Doctor Avatar Simulated Feed */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-sky-700/50 border-2 border-sky-400 flex items-center justify-center text-white mb-2 shadow-lg">
                  <User className="w-12 h-12" />
                </div>
                <h4 className="text-white font-bold text-sm">{activeCallApt.doctor_name}</h4>
                <span className="text-xs text-sky-300">{activeCallApt.specialty} • Max Healthcare</span>
                <p className="text-[11px] text-slate-400 mt-1 italic">"I am reviewing your live ESP32 telemetry stream right now."</p>
              </div>

              {/* Patient PiP / Telemetry overlay */}
              <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 p-2.5 rounded-xl text-left text-xs text-white shadow-lg backdrop-blur-sm">
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">
                  📡 Patient Telemetry Feed
                </span>
                <div className="font-mono text-[11px] space-y-0.5">
                  <div>HR: <strong className="text-emerald-400">{telemetry?.heart_rate || 75} BPM</strong></div>
                  <div>SpO2: <strong className="text-sky-400">{telemetry?.spo2 || 98}%</strong></div>
                  <div>Temp: <strong className="text-indigo-400">{telemetry?.temperature_c || 36.8}°C</strong></div>
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full text-white ${isMuted ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full text-white ${isVideoOff ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setActiveCallApt(null)}
                className="py-3 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Slot Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              Schedule Doctor Consultation
            </h4>
            <form onSubmit={handleBook} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={newApt.doctor_name}
                  onChange={e => setNewApt({ ...newApt, doctor_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Specialty</label>
                  <input
                    type="text"
                    value={newApt.specialty}
                    onChange={e => setNewApt({ ...newApt, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Date & Time</label>
                  <input
                    type="text"
                    value={newApt.date}
                    onChange={e => setNewApt({ ...newApt, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Mode</label>
                <select
                  value={newApt.mode}
                  onChange={e => setNewApt({ ...newApt, mode: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Teleconsultation">Teleconsultation (Video Call)</option>
                  <option value="In-Clinic">In-Clinic Visit</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold shadow-md"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
