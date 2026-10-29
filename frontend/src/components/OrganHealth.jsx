import React from 'react';
import { ShieldCheck, Heart, Wind, Flame, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export function OrganHealth({ organData, diseaseRisk, lang, t }) {
  const organs = organData?.organs || [
    { name: "Cardiovascular (Heart)", score: 92, status: "Optimal Rhythm" },
    { name: "Respiratory (Lungs)", score: 96, status: "Normal SpO2 98%" },
    { name: "Thermoregulatory", score: 94, status: "Afebrile 36.8°C" },
    { name: "Renal (Kidneys)", score: 90, status: "Creatinine 0.9 mg/dL" },
    { name: "Metabolic & Liver", score: 88, status: "Fasting Sugar 94 mg/dL" }
  ];

  const overallScore = organData?.overall_health_score || 91;

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.organHealth} & {t.diseaseRisk}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'सेंसर व लैब रिपोर्ट पर आधारित स्वास्थ्य सूचकांक' : 'Continuous multi-organ telemetry & clinical risk index'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Overall Score:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 font-mono">
            {overallScore}/100 {organData?.grade || 'Optimal'}
          </span>
        </div>
      </div>

      {/* Organ Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {organs.map((organ, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {organ.name}
            </span>
            <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mb-1">
              {organ.score}%
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              {organ.status}
            </span>
          </div>
        ))}
      </div>

      {/* Disease Risk Indicators */}
      <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-2 mb-2 font-bold text-xs text-indigo-900 dark:text-indigo-300">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Clinical 10-Year Risk Assessment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 text-[10.5px] block">Cardiovascular Risk</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              Low-Moderate (11%)
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 text-[10.5px] block">Hypertension Status</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">
              Stage 1 Controlled
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 text-[10.5px] block">Type-2 Diabetes Risk</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              Low (6%) Fasting 94mg/dL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
