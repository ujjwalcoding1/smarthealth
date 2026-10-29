import React, { useState } from 'react';
import { Phone, MessageSquare, ShieldAlert, Plus, UserCheck, Star } from 'lucide-react';

export function EmergencyContacts({ contacts, onAddContact, onTriggerManualSOS, telemetry, lang, t }) {
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'Family Member',
    phone: '',
    is_primary: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    if (onAddContact) {
      onAddContact(newContact);
    }
    setShowModal(false);
    setNewContact({ name: '', relationship: 'Family Member', phone: '', is_primary: false });
  };

  const handleSendSMS = (phone) => {
    const lat = telemetry?.latitude || 28.6139;
    const lng = telemetry?.longitude || 77.2090;
    const smsBody = encodeURIComponent(
      `SMARTHEALTH SOS ALERT: Patient Rajesh Sharma needs immediate medical attention! Live Location: https://maps.google.com/?q=${lat},${lng} | HR: ${telemetry?.heart_rate || 75} BPM`
    );
    window.location.href = `sms:${phone}?body=${smsBody}`;
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.emergencyContacts}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'आपातकाल में तुरंत कॉल और एसएमएस अलर्ट' : 'Instant 1-tap phone dialer & SMS location broadcast'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerManualSOS}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS Panic</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {contacts && contacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
              contact.is_primary
                ? 'bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {contact.name}
                </span>
                {contact.is_primary && (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    PRIMARY
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 block mb-2">
                {contact.relationship}
              </span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 block mb-3">
                {contact.phone}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <button
                onClick={() => handleSendSMS(contact.phone)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
                title="Send GPS Alert SMS"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              Add Emergency Contact
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Contact / Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Verma / Ramesh Sharma"
                  value={newContact.name}
                  onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiologist, Son, Daughter"
                  value={newContact.relationship}
                  onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210 or 112"
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={newContact.is_primary}
                  onChange={e => setNewContact({ ...newContact, is_primary: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="primaryCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Set as Primary SOS Auto-Dial Target
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
