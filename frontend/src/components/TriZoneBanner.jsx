import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, HeartPulse, PhoneCall, Pill, Activity, Radio, Clock } from 'lucide-react';

export function TriZoneBanner({ evaluation, telemetry, hardwareActive = false, isSimulated = false, onOpenSOS, lang, t }) {
  if (!evaluation) return null;

  const isLive = Boolean(hardwareActive || telemetry?.sensor_source === 'HARDWARE');
  const isSim = Boolean(isSimulated);
  const isStandby = !isLive && !isSim;

  const isRed = evaluation.zone === 'RED' && !isStandby;
  const isYellow = evaluation.zone === 'YELLOW' && !isStandby;
  const isGreen = evaluation.zone === 'GREEN' && !isStandby;

  // Standby Banner when ESP32 is offline and no simulation is triggered
  if (isStandby) {
    return (
      <div className="w-full rounded-2xl p-5 mb-6 transition-all duration-300 border-2 shadow-sm bg-slate-100/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 shadow-sm">
              <Radio className="w-8 h-8 animate-pulse text-sky-500" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  {lang === 'hi' ? 'स्टैंडबाय मोड' : 'STANDBY MODE'}
                </span>
                <span className="text-xs bg-slate-200/80 dark:bg-slate-800/80 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
                  {lang === 'hi' ? 'हार्डवेयर प्रतीक्षारत' : 'Hardware Idle'}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {lang === 'hi' 
                  ? 'ESP32 हार्डवेयर की प्रतीक्षा है (सेंसर स्टैंडबाय)' 
                  : 'Awaiting ESP32 Hardware Stream (Sensor Standby)'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {lang === 'hi'
                  ? 'असली वाइटल्स के लिए कृपया ESP32 को वाई-फाई से कनेक्ट करें और MAX30102 सेंसर पर उंगली रखें। किसी भी डेटा टकराव को रोकने के लिए कोई भी फर्जी या डेमो डेटा नहीं दिखाया जा रहा है (---)।'
                  : 'Connect your ESP32 to Wi-Fi and place your finger steadily on the MAX30102 sensor to view live vitals. Default fake data is suppressed to avoid collisions (---).'}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-400 block">IoT Stream Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              {lang === 'hi' ? 'ESP32 ऑफलाइन (---)' : 'ESP32 Offline (---)'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl p-5 mb-6 transition-all duration-300 border-2 shadow-lg ${
      isRed
        ? 'bg-red-500/10 border-red-500 text-red-950 dark:text-red-100 emergency-critical-active'
        : isYellow
        ? 'bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-100 warning-yellow-active'
        : 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100'
    }`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status icon and label */}
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl flex items-center justify-center text-white shadow-md ${
            isRed ? 'bg-red-600 animate-bounce' : isYellow ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            {isRed && <ShieldAlert className="w-8 h-8" />}
            {isYellow && <AlertTriangle className="w-8 h-8" />}
            {isGreen && <CheckCircle2 className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                isRed ? 'bg-red-600' : isYellow ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {evaluation.zone} ZONE
              </span>
              <span className="text-sm font-semibold opacity-80">
                {isRed ? t.statusCritical : isYellow ? t.statusWarning : t.statusNormal}
              </span>
              <span className="text-xs bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded text-slate-700 dark:text-slate-200 font-mono">
                Code {evaluation.status_code}: {evaluation.severity_level}
              </span>
              {isLive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700">
                  REAL ESP32
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              {evaluation.summary_message}
            </h2>
            {evaluation.symptoms_detected && evaluation.symptoms_detected.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {evaluation.symptoms_detected.map((symptom, idx) => (
                  <span key={idx} className="text-xs font-medium bg-white/70 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-1">
                    <Activity className="w-3 h-3 text-red-500" />
                    {symptom}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {isRed && (
            <button
              onClick={onOpenSOS}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <PhoneCall className="w-4 h-4" />
              {t.dialNow}
            </button>
          )}

          {isYellow && (
            <a
              href="#yellow-recommendations"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs md:text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Pill className="w-4 h-4" />
              {lang === 'hi' ? 'दवाई व सुझाव देखें' : 'View Care & Medicines'}
            </a>
          )}

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono opacity-70 block">IoT Stream Status</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {isLive ? 'Real IoT Connected' : 'Simulated Stream'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
