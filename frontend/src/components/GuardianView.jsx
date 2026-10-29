import React from 'react';
import { Users, Phone, MapPin, Heart, CheckCircle2, ShieldAlert } from 'lucide-react';

export function GuardianView({ telemetry, zoneEvaluation, medicines, lang, t }) {
  const hr = telemetry?.heart_rate || 75;
  const temp = telemetry?.temperature_c || 36.8;
  const takenMeds = medicines?.filter(m => m.taken_today).length || 0;
  const totalMeds = medicines?.length || 4;

  return (
    <div className="health-card mb-6 border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900/40">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.caregiverView}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'परिवार एवं अभिभावक के लिए दूरस्थ निगरानी पोर्टल' : 'Remote family member & caregiver telemetry dashboard'}
            </span>
          </div>
        </div>

        <span className="badge badge-green text-[10px]">
          Guardian Connected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 block mb-0.5">Patient Safety Status</span>
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
            <span className={`w-2.5 h-2.5 rounded-full ${
              zoneEvaluation?.zone === 'RED' ? 'bg-red-500 animate-ping' : zoneEvaluation?.zone === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            <span>{zoneEvaluation?.zone || 'GREEN'} ZONE</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">No fall detected today</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 block mb-0.5">Medicine Adherence</span>
          <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
            {takenMeds} of {totalMeds} Doses Taken
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Next: Atorvastatin at 08:30 PM</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block mb-0.5">Primary Contact</span>
            <strong className="text-slate-800 dark:text-slate-200 block text-xs">Ananya (Daughter)</strong>
            <span className="font-mono text-[11px] text-slate-400">+91 9811223344</span>
          </div>
          <a
            href="tel:+919811223344"
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
