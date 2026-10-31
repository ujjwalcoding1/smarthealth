import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, User, Save, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

export function SOSSettingsModal({ isOpen, onClose, sosConfig, onSaveConfig, lang }) {
  const [config, setConfig] = useState({
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
    custom_message: "EMERGENCY: Patient fell or requires urgent medical attention!"
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (sosConfig) {
      setConfig(prev => ({ ...prev, ...sosConfig }));
    }
  }, [sosConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSaveConfig) {
      onSaveConfig(config);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="p-2 rounded-xl bg-red-600 text-white shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {lang === 'hi' ? 'आपातकालीन एसओएस नंबर प्रबंधित करें' : 'Emergency SOS Dialer Settings'}
            </h3>
            <p className="text-slate-500 text-[11px]">
              {lang === 'hi' ? 'फॉल या एसओएस पर किस नंबर पर कॉल व एसएमएस जाएगी, यहाँ से बदलें' : 'Configure the exact numbers dialed automatically during fall or panic triggers.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Primary SOS Number and Name */}
          <div className="p-3 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60">
            <label className="block text-red-900 dark:text-red-300 font-bold mb-1 text-xs flex items-center justify-between">
              <span>🚨 Primary SOS Auto-Dial & SMS Target</span>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono">PRIORITY 1</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Contact Label</label>
                <input
                  type="text" required
                  value={config.primary_contact_name || ''}
                  onChange={e => setConfig({ ...config, primary_contact_name: e.target.value })}
                  placeholder="e.g. My Phone"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel" required
                  value={config.primary_sos_number || ''}
                  onChange={e => setConfig({ ...config, primary_sos_number: e.target.value })}
                  placeholder="e.g. +919811223344"
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Emergency Alert Email</label>
              <input
                type="email"
                value={config.alert_email || ''}
                onChange={e => setConfig({ ...config, alert_email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <span className="text-[10.5px] text-red-700 dark:text-red-400 mt-1.5 block">
              Directly dials and sends SMS to this number with live GPS coordinates, instead of calling 112.
            </span>
          </div>

          {/* Secondary Guardian */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Guardian Name</label>
              <input
                type="text" required
                value={config.secondary_guardian_name}
                onChange={e => setConfig({ ...config, secondary_guardian_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Guardian Phone</label>
              <input
                type="tel" required
                value={config.secondary_guardian_number}
                onChange={e => setConfig({ ...config, secondary_guardian_number: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Ambulance & Doctor */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ambulance Line</label>
              <input
                type="text"
                value={config.ambulance_number}
                onChange={e => setConfig({ ...config, ambulance_number: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Doctor Phone</label>
              <input
                type="tel"
                value={config.doctor_phone}
                onChange={e => setConfig({ ...config, doctor_phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Delay Seconds */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Auto-Dial Safety Countdown (Seconds)</span>
              <span className="font-mono text-indigo-600 font-bold">{config.auto_dial_delay_seconds}s</span>
            </label>
            <input
              type="range" min="5" max="30" step="1"
              value={config.auto_dial_delay_seconds}
              onChange={e => setConfig({ ...config, auto_dial_delay_seconds: Number(e.target.value) })}
              className="w-full accent-red-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">Gives patient time to cancel false alarms if uninjured.</span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>SOS numbers updated and armed successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save SOS Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
