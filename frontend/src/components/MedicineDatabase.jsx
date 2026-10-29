import React, { useState } from 'react';
import { Pill, Search, AlertCircle, CheckCircle, Info, ShieldCheck, Tag } from 'lucide-react';

export function MedicineDatabase({ medicines, lang }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Fever & Pain', 'Antibiotic', 'Cardiac', 'Acidity', 'Allergy', 'Diabetes'];

  const filtered = medicines?.filter(med => {
    const matchesSearch = med.brand_name.toLowerCase().includes(search.toLowerCase()) ||
                          med.generic_name.toLowerCase().includes(search.toLowerCase()) ||
                          med.illness_treated.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === 'ALL') return matchesSearch;
    return matchesSearch && (
      med.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      med.illness_treated.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }) || [];

  return (
    <div className="health-card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'hi' ? 'दवाई एवं उपचार निर्देशिका' : 'Medical Prescription & Drug Directory'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'किसी भी बीमारी की दवाइयाँ, कम्पोज़ीशन, सही खुराक और सावधानियाँ' : 'Search medicines for any illness: generic composition, safe dosage, meal timing & precautions.'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'hi' ? 'बीमारी या दवा का नाम खोजें...' : 'Search illness (e.g. fever, acidity, BP)...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Medicines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((med) => (
          <div
            key={med.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {med.brand_name}
                  </h4>
                  <span className="text-slate-500 font-mono text-[11px] block">
                    {med.generic_name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm block">
                    ₹{med.price_inr}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    med.prescription_required ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {med.prescription_required ? 'Rx Required' : 'OTC Available'}
                  </span>
                </div>
              </div>

              {/* Treats */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-900/60 border border-amber-200/80 dark:border-amber-900/60 my-2.5">
                <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-400 block mb-0.5">
                  Treats / Indications:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium text-[11.5px]">
                  {med.illness_treated}
                </p>
              </div>

              {/* Dosage & Timing */}
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Dosage:</strong> {med.dosage_adult}
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Timing:</strong> {med.meal_instruction} ({med.frequency})
                </div>
              </div>

              {/* Precautions */}
              {med.precautions && (
                <p className="text-[10.5px] text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 italic mb-2">
                  ⚠️ {med.precautions}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Category: {med.category}</span>
              <span className="text-emerald-600 font-semibold">Jan Aushadhi Eligible</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
