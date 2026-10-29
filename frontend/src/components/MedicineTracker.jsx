import React, { useState } from 'react';
import { Pill, Check, Clock, AlertTriangle, Plus, Package } from 'lucide-react';

export function MedicineTracker({ medicines, onToggleTaken, onAddMedicine, lang, t }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    timing: '08:00 AM',
    meal_relation: 'After Meal',
    purpose: '',
    stock_count: 30
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name) return;
    if (onAddMedicine) {
      onAddMedicine(newMed);
    }
    setShowAddModal(false);
    setNewMed({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      timing: '08:00 AM',
      meal_relation: 'After Meal',
      purpose: '',
      stock_count: 30
    });
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.medicineSchedule}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'दवाइयों का दैनिक समय और खुराक प्रबंधन' : 'Daily prescription schedule & refill tracker'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'दवा जोड़ें' : 'Add Medicine'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {medicines && medicines.map((med) => (
          <div
            key={med.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              med.taken_today
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {med.name}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {med.dosage}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                {med.purpose}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                  <Clock className="w-3 h-3 text-sky-500" />
                  {med.timing} ({med.meal_relation})
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Package className="w-3 h-3 text-slate-400" />
                  {med.stock_count} {lang === 'hi' ? 'गोलियां शेष' : 'pills left'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleTaken(med.id, !med.taken_today)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                med.taken_today
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">
                {med.taken_today ? t.taken : t.takeDose}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              {lang === 'hi' ? 'नई दवाई जोड़ें' : 'Add New Prescription'}
            </h4>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 650mg"
                  value={newMed.name}
                  onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg / 1 tab"
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={newMed.timing}
                    onChange={e => setNewMed({ ...newMed, timing: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Purpose / Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Fever reduction (Yellow Zone)"
                  value={newMed.purpose}
                  onChange={e => setNewMed({ ...newMed, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-md"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
