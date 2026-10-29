import React from 'react';
import { PlayCircle, ShieldAlert, AlertTriangle, CheckCircle2, HeartPulse, Activity, Zap } from 'lucide-react';

export function SimulatorBar({ currentMode, onSetMode, onTriggerFall, lang, t }) {
  return (
    <div className="health-card mb-6 border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t.simulatorControl}
            </h4>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' 
                ? 'हार्डवेयर के बिना तीनों ज़ोन और फॉल डिटेक्शन का तुरंत लाइव परीक्षण करें' 
                : 'Test tri-color zones, medicine suggestions & fall dialer without physical sensors'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500">Active Preset:</span>
          <span className="px-2 py-0.5 rounded font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
            {currentMode}
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Normal Green */}
        <button
          onClick={() => onSetMode('NORMAL')}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            currentMode === 'NORMAL'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50'
              : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.simNormal}</span>
        </button>

        {/* 2. Yellow Fever */}
        <button
          onClick={() => onSetMode('YELLOW_FEVER')}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            currentMode === 'YELLOW_FEVER'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
              : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.simFever}</span>
        </button>

        {/* 3. Yellow Tachycardia */}
        <button
          onClick={() => onSetMode('YELLOW_TACHY')}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            currentMode === 'YELLOW_TACHY'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
              : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{t.simTachy}</span>
        </button>

        {/* 4. Yellow SpO2 */}
        <button
          onClick={() => onSetMode('YELLOW_SPO2')}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            currentMode === 'YELLOW_SPO2'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
              : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{t.simSpo2}</span>
        </button>

        {/* 5. Fall Impact (Red) */}
        <button
          onClick={() => {
            onSetMode('RED_FALL');
            if (onTriggerFall) onTriggerFall();
          }}
          className="py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md animate-pulse active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t.simFall}</span>
        </button>

        {/* 6. Critical Red */}
        <button
          onClick={() => onSetMode('RED_CRITICAL')}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            currentMode === 'RED_CRITICAL'
              ? 'bg-red-700 text-white border-red-700 shadow-md ring-2 ring-red-400/50'
              : 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t.simCritical}</span>
        </button>
      </div>
    </div>
  );
}
