import React from 'react';
import { Moon, Sparkles, CheckCircle2 } from 'lucide-react';

export function SleepTracker({ sleepData, lang, t }) {
  const duration = sleepData?.last_night_duration_hours || 7.4;
  const score = sleepData?.sleep_score || 86;
  const deep = sleepData?.deep_sleep_hours || 2.1;
  const rem = sleepData?.rem_sleep_hours || 1.8;
  const light = sleepData?.light_sleep_hours || 3.5;

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600 text-white shadow-sm">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.sleepQuality}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'नींद की गुणवत्ता और रीस्टोरेटिव रिकवरी' : 'Circadian cycle & deep sleep recovery score'}
            </span>
          </div>
        </div>

        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-200">
          Score: {score}/100
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 block">Total Sleep</span>
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {duration} hrs
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Target 8.0h</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 block">Deep Sleep</span>
          <span className="text-xl font-bold font-mono text-violet-600 dark:text-violet-400">
            {deep} hrs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Tissue Repair</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 block">REM Dream</span>
          <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
            {rem} hrs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cognitive Reset</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 block">Sleep Resting HR</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            61.2 BPM
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy Dip</span>
        </div>
      </div>
    </div>
  );
}
