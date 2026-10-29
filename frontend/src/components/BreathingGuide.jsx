import React, { useState, useEffect } from 'react';
import { Wind, Play, Square, Heart } from 'lucide-react';

export function BreathingGuide({ currentHr, lang, t }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // 'Inhale', 'Hold', 'Exhale'
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    if (!isActive) {
      setPhase('Inhale');
      setSeconds(4);
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const getPhaseColor = () => {
    if (phase === 'Inhale') return 'from-sky-400 to-indigo-500 scale-125';
    if (phase === 'Hold') return 'from-indigo-500 to-purple-600 scale-125';
    return 'from-teal-400 to-emerald-500 scale-90';
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-sm">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.breathingTool}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'हृदय गति को शांत करने के लिए 4-7-8 प्राणायाम' : 'Vagal nerve stimulation for cardiac deceleration'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 shadow-sm transition-all ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? t.stopBreathing : t.startBreathing}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Animated Orb */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-tr shadow-xl flex items-center justify-center text-white font-extrabold text-center transition-all duration-1000 ${
              isActive ? getPhaseColor() : 'from-indigo-400 to-indigo-600'
            }`}
          >
            <div>
              <span className="text-xs uppercase tracking-wider block opacity-90">
                {isActive ? phase : 'Ready'}
              </span>
              <span className="text-3xl font-mono">
                {isActive ? `${seconds}s` : '4-7-8'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex-1 text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-md">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[10px]">1</span>
            <span><strong>Inhale (4s):</strong> Breathe in quietly through nose, filling diaphragm.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[10px]">2</span>
            <span><strong>Hold (7s):</strong> Retain breath comfortably without strain.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">3</span>
            <span><strong>Exhale (8s):</strong> Blow air out completely through mouth.</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Current HR: <strong className="text-indigo-600 dark:text-indigo-400">{currentHr || 75} BPM</strong>. Calms sympathetic stress within 4 breath cycles.
          </div>
        </div>
      </div>
    </div>
  );
}
