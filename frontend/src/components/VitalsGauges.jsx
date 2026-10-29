import React, { useState } from 'react';
import { Heart, Activity, Thermometer, Compass, MapPin, Gauge, ShieldCheck, AlertCircle } from 'lucide-react';

export function VitalsGauges({ telemetry, zoneEvaluation, lang, t }) {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const hr = telemetry?.heart_rate || 72.0;
  const spo2 = telemetry?.spo2 || 98.0;
  const tempC = telemetry?.temperature_c || 36.8;
  const tempF = tempC * 9 / 5 + 32;
  const accel = telemetry?.acceleration_g || 0.99;
  const ax = telemetry?.ax || 0.02;
  const ay = telemetry?.ay || -0.04;
  const az = telemetry?.az || 0.99;
  const lat = telemetry?.latitude || 28.6139;
  const lng = telemetry?.longitude || 77.2090;
  const sats = telemetry?.satellites || 6;
  const impact = telemetry?.impact_detected || (accel >= 2.5);

  // Status colors based on individual metric ranges
  const getHrColor = (val) => {
    if (val > 125 || (val < 45 && val > 0)) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (val > 100 || val < 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';
  };

  const getSpo2Color = (val) => {
    if (val < 90) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (val <= 94) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800';
  };

  const getTempColor = (c) => {
    if (c >= 39.5 || (c >= 32.0 && c < 35.0)) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (c >= 37.3 && c < 39.5) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Heart Rate (MAX30102) */}
      <div className={`health-card border transition-all ${getHrColor(hr)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.heartRate}
          </span>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
            <Heart className={`w-5 h-5 text-red-500 ${hr > 100 ? 'animate-bounce' : 'animate-heartbeat'}`} />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {hr.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-500">BPM</span>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>{hr >= 60 && hr <= 100 ? 'Normal Rhythm' : hr > 100 ? 'Elevated (Tachy)' : 'Bradycardia'}</span>
          <span className="font-mono text-[11px]">MAX30102 I2C</span>
        </div>
      </div>

      {/* 2. SpO2 Blood Oxygen (MAX30102) */}
      <div className={`health-card border transition-all ${getSpo2Color(spo2)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.spo2}
          </span>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
            <Activity className="w-5 h-5 text-sky-500" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {spo2.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-500">%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden my-2">
          <div
            className={`h-full transition-all duration-500 ${
              spo2 < 90 ? 'bg-red-500' : spo2 <= 94 ? 'bg-amber-500' : 'bg-sky-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, spo2))}%` }}
          ></div>
        </div>

        <div className="text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>{spo2 >= 95 ? 'Normal Saturation' : spo2 >= 90 ? 'Borderline (Yellow)' : 'Hypoxia Alert!'}</span>
          <span className="font-mono text-[11px]">Red/IR</span>
        </div>
      </div>

      {/* 3. Body Temperature (DS18B20) */}
      <div className={`health-card border transition-all ${getTempColor(tempC)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.temperature}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUseFahrenheit(!useFahrenheit)}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            >
              {useFahrenheit ? '°C' : '°F'}
            </button>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
              <Thermometer className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {useFahrenheit ? tempF.toFixed(1) : tempC.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-slate-500">{useFahrenheit ? '°F' : '°C'}</span>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>
            {tempC >= 39.5 ? 'High Fever (Critical)' :
             tempC >= 37.3 ? 'Mild Fever (Yellow Zone)' :
             tempC >= 35.0 ? 'Afebrile (Normal Body)' :
             tempC >= 32.0 ? 'Hypothermia Warning' :
             'Ambient Room Temp'}
          </span>
          <span className="font-mono text-[11px]">DS18B20 1-Wire</span>
        </div>
      </div>

      {/* 4. MPU6050 Acceleration & Fall Status */}
      <div className={`health-card border transition-all ${
        impact ? 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-400 emergency-critical-active' : 'text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.acceleration}
          </span>
          <div className={`p-2 rounded-xl shadow-sm ${impact ? 'bg-red-600 text-white animate-bounce' : 'bg-white/80 dark:bg-slate-800/80'}`}>
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${impact ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {accel.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-slate-500">g</span>
        </div>

        {/* 3-axis mini pill */}
        <div className="flex items-center gap-1.5 my-2 text-[10px] font-mono text-slate-500">
          <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">X:{ax.toFixed(2)}</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Y:{ay.toFixed(2)}</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Z:{az.toFixed(2)}</span>
        </div>

        <div className="text-xs flex items-center justify-between">
          <span className={impact ? 'font-bold text-red-600 animate-pulse' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
            {impact ? '🚨 IMPACT DETECTED!' : 'Normal Posture'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">MPU-6050</span>
        </div>
      </div>
    </div>
  );
}
