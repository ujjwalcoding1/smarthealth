import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, HeartPulse, Activity, Zap, Lock, Radio } from 'lucide-react';

export function SimulatorBar({ currentMode, onSetMode, onTriggerFall, hardwareActive, lang, t }) {
  return (
    <div className="health-card mb-6 border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60">
      {/* Dynamic Status Notification: Real Hardware vs Simulation */}
      {hardwareActive ? (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {lang === 'hi' 
                ? 'ESP32 हार्डवेयर ऑनलाइन है (Live Real Sensors)' 
                : 'Physical ESP32 Online (Live Telemetry)'}
            </span>
            <span className="hidden md:inline text-emerald-700 dark:text-emerald-300 text-[11px]">
              — {lang === 'hi'
                  ? 'डेटा टकराव रोकने के लिए सिमुलेटर टेस्ट बटन्स स्वतः लॉक हैं।'
                  : 'Simulator paused to guarantee 100% real sensor telemetry.'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              HARDWARE PRIORITY
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="font-semibold text-[11.5px]">
              {lang === 'hi'
                ? 'ESP32 हार्डवेयर ऑफलाइन है — सिमुलेशन टेस्ट मोड सक्रिय'
                : 'ESP32 Hardware Offline — Simulation Test Mode Active'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">FALLBACK STANDBY</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {t.simulatorControl}
              {hardwareActive && (
                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {lang === 'hi' ? 'पॉज़्ड (हार्डवेयर चालू)' : 'Paused (Hardware Active)'}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500">
              {hardwareActive 
                ? (lang === 'hi' 
                    ? 'अकेले असली ESP32 का डेटा दिखाया जा रहा है। सिमुलेटर डेमो डेटा बंद है।' 
                    : 'Real ESP32 vitals have 100% exclusive priority. Demo data is muted.')
                : (lang === 'hi' 
                    ? 'हार्डवेयर के बिना तीनों ज़ोन और फॉल डिटेक्शन का तुरंत लाइव परीक्षण करें' 
                    : 'Test tri-color zones, medicine suggestions & fall dialer without physical sensors')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500">Mode:</span>
          <span className="px-2 py-0.5 rounded font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
            {hardwareActive ? 'REAL_ESP32' : currentMode}
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Normal Green */}
        <button
          disabled={hardwareActive}
          onClick={() => onSetMode('NORMAL')}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Normal Green Zone"}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive 
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : currentMode === 'NORMAL'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50'
                : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.simNormal}</span>
        </button>

        {/* 2. Yellow Fever */}
        <button
          disabled={hardwareActive}
          onClick={() => onSetMode('YELLOW_FEVER')}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Yellow Fever Zone"}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive 
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : currentMode === 'YELLOW_FEVER'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.simFever}</span>
        </button>

        {/* 3. Yellow Tachycardia */}
        <button
          disabled={hardwareActive}
          onClick={() => onSetMode('YELLOW_TACHY')}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Yellow Tachycardia Zone"}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive 
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : currentMode === 'YELLOW_TACHY'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{t.simTachy}</span>
        </button>

        {/* 4. Yellow SpO2 */}
        <button
          disabled={hardwareActive}
          onClick={() => onSetMode('YELLOW_SPO2')}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Yellow Low SpO2 Zone"}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive 
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : currentMode === 'YELLOW_SPO2'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/50'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{t.simSpo2}</span>
        </button>

        {/* 5. Fall Impact (Red) */}
        <button
          disabled={hardwareActive}
          onClick={() => {
            if (hardwareActive) return;
            onSetMode('RED_FALL');
            if (onTriggerFall) onTriggerFall();
          }}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Fall Impact Simulation"}
          className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md animate-pulse active:scale-95'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t.simFall}</span>
        </button>

        {/* 6. Critical Red */}
        <button
          disabled={hardwareActive}
          onClick={() => onSetMode('RED_CRITICAL')}
          title={hardwareActive ? "Hardware active: Disconnect ESP32 to test simulation" : "Critical Emergency Red Zone"}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            hardwareActive
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              : currentMode === 'RED_CRITICAL'
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
