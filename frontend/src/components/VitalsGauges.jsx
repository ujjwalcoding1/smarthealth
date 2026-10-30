import React, { useState } from 'react';
import { Heart, Activity, Thermometer, Compass, MapPin, ExternalLink, Satellite, Radio, Loader2 } from 'lucide-react';

export function VitalsGauges({ telemetry, zoneEvaluation, hardwareActive = false, isSimulated = false, lang, t }) {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  // Determine if telemetry is actively received from hardware or deliberate simulation
  const isLiveHardware = Boolean(hardwareActive || telemetry?.sensor_source === 'HARDWARE');
  const isDeliberateSim = Boolean(isSimulated);
  const isSourceActive = isLiveHardware || isDeliberateSim;

  // 1. Heart Rate (MAX30102)
  const rawHr = telemetry?.heart_rate;
  const fingerOn = Boolean(telemetry?.finger_detected);
  const hasValidHr = isSourceActive && rawHr !== undefined && rawHr !== null && Number(rawHr) > 25 && fingerOn;
  const hr = hasValidHr ? Number(rawHr) : null;

  // 2. SpO2 Blood Oxygen (MAX30102)
  const rawSpo2 = telemetry?.spo2;
  const hasValidSpo2 = isSourceActive && rawSpo2 !== undefined && rawSpo2 !== null && Number(rawSpo2) > 25 && fingerOn;
  const spo2 = hasValidSpo2 ? Number(rawSpo2) : null;

  // 3. Body Temperature (DS18B20)
  const rawTempC = telemetry?.temperature_c;
  const hasValidTemp = isSourceActive && rawTempC !== undefined && rawTempC !== null && Number(rawTempC) > 10;
  const tempC = hasValidTemp ? Number(rawTempC) : null;
  const tempF = hasValidTemp ? (tempC * 9 / 5 + 32) : null;

  // 4. Motion & Acceleration (MPU6050)
  const hasValidAccel = isSourceActive && telemetry?.acceleration_g !== undefined && telemetry?.acceleration_g !== null;
  const accel = hasValidAccel ? Number(telemetry.acceleration_g) : null;
  const ax = hasValidAccel && telemetry?.ax !== undefined ? Number(telemetry.ax) : null;
  const ay = hasValidAccel && telemetry?.ay !== undefined ? Number(telemetry.ay) : null;
  const az = hasValidAccel && telemetry?.az !== undefined ? Number(telemetry.az) : null;
  const impact = Boolean(telemetry?.impact_detected || (accel && accel >= 2.8));

  // 5. GPS Location (NEO-6M)
  const gpsValid = Boolean(telemetry?.gps_valid);
  const sats = Number(telemetry?.satellites || 0);
  const hasValidGps = isSourceActive && (gpsValid || sats > 0) && telemetry?.latitude && telemetry?.longitude;
  const lat = hasValidGps ? Number(telemetry.latitude) : null;
  const lng = hasValidGps ? Number(telemetry.longitude) : null;

  // Dynamic status styling based on actual clinical thresholds
  const getHrColor = () => {
    if (!hr) return 'text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700';
    if (hr > 125 || hr < 45) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (hr > 100 || hr < 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';
  };

  const getSpo2Color = () => {
    if (!spo2) return 'text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700';
    if (spo2 < 90) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (spo2 <= 94) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800';
  };

  const getTempColor = () => {
    if (!tempC) return 'text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700';
    if (tempC >= 39.5 || tempC < 35.0) return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    if (tempC >= 37.3) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {/* 1. Heart Rate (MAX30102 Optical Sensor) */}
      <div className={`health-card border transition-all ${getHrColor()} flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.heartRate}
            </span>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
              <Heart className={`w-5 h-5 text-red-500 ${hr ? (hr > 100 ? 'animate-bounce' : 'animate-heartbeat') : 'opacity-30'}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {hr !== null ? hr.toFixed(1) : '---'}
            </span>
            <span className="text-sm font-semibold text-slate-500">BPM</span>
          </div>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
          <span className="truncate">
            {hr !== null
              ? (hr >= 60 && hr <= 100 ? 'Normal Rhythm' : hr > 100 ? 'Elevated (Tachy)' : 'Bradycardia')
              : isSourceActive 
                ? (lang === 'hi' ? 'सेंसर पर उंगली रखें' : 'Place finger on sensor') 
                : (lang === 'hi' ? 'ESP32 की प्रतीक्षा...' : 'Waiting for ESP32...')}
          </span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500 ml-1">
            MAX30102
          </span>
        </div>
      </div>

      {/* 2. SpO2 Blood Oxygen (MAX30102 Red/IR Optical) */}
      <div className={`health-card border transition-all ${getSpo2Color()} flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.spo2}
            </span>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
              <Activity className={`w-5 h-5 text-sky-500 ${spo2 ? 'animate-pulse' : 'opacity-30'}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {spo2 !== null ? spo2.toFixed(1) : '---'}
            </span>
            <span className="text-sm font-semibold text-slate-500">%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-500 ${
                !spo2 ? 'bg-slate-300 dark:bg-slate-700 w-0' : spo2 < 90 ? 'bg-red-500' : spo2 <= 94 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${spo2 ? Math.min(100, Math.max(0, spo2)) : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
          <span className="truncate">
            {spo2 !== null 
              ? (spo2 >= 95 ? 'Optimal Saturation' : spo2 >= 90 ? 'Borderline (Watch)' : 'Critical Hypoxia!') 
              : isSourceActive 
                ? (lang === 'hi' ? 'सेंसर पर उंगली रखें' : 'Place finger on sensor') 
                : (lang === 'hi' ? 'ESP32 की प्रतीक्षा...' : 'Waiting for ESP32...')}
          </span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500 ml-1">
            Red/IR
          </span>
        </div>
      </div>

      {/* 3. Body Temperature (DS18B20 OneWire Sensor) */}
      <div className={`health-card border transition-all ${getTempColor()} flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.temperature}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUseFahrenheit(!useFahrenheit)}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
              >
                {useFahrenheit ? '°C' : '°F'}
              </button>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                <Thermometer className={`w-5 h-5 text-indigo-500 ${tempC ? '' : 'opacity-30'}`} />
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {tempC !== null ? (useFahrenheit ? tempF.toFixed(1) : tempC.toFixed(2)) : '---'}
            </span>
            <span className="text-sm font-semibold text-slate-500">{useFahrenheit ? '°F' : '°C'}</span>
          </div>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
          <span className="truncate">
            {tempC !== null
              ? (tempC >= 39.5 ? 'High Fever (Critical)' :
                 tempC >= 37.3 ? 'Mild Fever (Yellow Zone)' :
                 tempC >= 35.0 ? 'Afebrile (Normal Body)' :
                 'Hypothermia Warning')
              : isSourceActive 
                ? (lang === 'hi' ? 'तापमान मापा जा रहा है' : 'Reading temperature...') 
                : (lang === 'hi' ? 'ESP32 की प्रतीक्षा...' : 'Waiting for ESP32...')}
          </span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500 ml-1">
            DS18B20
          </span>
        </div>
      </div>

      {/* 4. MPU-6050 Motion & Fall Sensor */}
      <div className={`health-card border transition-all ${
        impact ? 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-400 emergency-critical-active' : 'text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
      } flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.acceleration}
            </span>
            <div className={`p-2 rounded-xl shadow-sm ${impact ? 'bg-red-600 text-white animate-bounce' : 'bg-white/80 dark:bg-slate-800/80'}`}>
              <Compass className="w-5 h-5 text-indigo-500" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight ${impact ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {accel !== null ? accel.toFixed(2) : '---'}
            </span>
            <span className="text-sm font-semibold text-slate-500">g</span>
          </div>

          {/* 3-axis mini pill */}
          <div className="flex items-center gap-1.5 my-1 text-[10px] font-mono text-slate-500">
            <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">X:{ax !== null ? ax.toFixed(2) : '--'}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Y:{ay !== null ? ay.toFixed(2) : '--'}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Z:{az !== null ? az.toFixed(2) : '--'}</span>
          </div>
        </div>

        <div className="text-xs flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
          <span className={impact ? 'font-bold text-red-600 animate-pulse truncate' : 'text-emerald-600 dark:text-emerald-400 font-medium truncate'}>
            {accel !== null 
              ? (impact ? '🚨 IMPACT DETECTED!' : 'Normal Posture')
              : (lang === 'hi' ? 'ESP32 की प्रतीक्षा...' : 'Waiting for ESP32...')}
          </span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500 ml-1">
            MPU-6050
          </span>
        </div>
      </div>

      {/* 5. NEO-6M GPS Geolocation Sensor Module */}
      <div className="health-card border transition-all text-slate-700 bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {lang === 'hi' ? 'जीपीएस लोकेशन' : 'GPS Location'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                gpsValid 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300' 
                  : sats > 0 
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                <Satellite className="w-3 h-3" />
                {sats > 0 ? `${sats} Sats` : '0 Sats'}
              </span>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm text-emerald-600">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="my-1">
            <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
              {hasValidGps ? (
                <>
                  <span>{lat.toFixed(4)}° N,</span>
                  <span>{lng.toFixed(4)}° E</span>
                </>
              ) : (
                <span>---</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${gpsValid ? 'bg-emerald-500 animate-pulse' : sats > 0 ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
              <span>
                {hasValidGps 
                  ? '3D Satellite Fix (Active)' 
                  : sats > 0 
                    ? `Tracking ${sats} Satellites` 
                    : (lang === 'hi' ? 'ESP32 GPS की प्रतीक्षा...' : 'Waiting for ESP32 GPS...')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
          {hasValidGps ? (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline text-[11px]"
            >
              <span>{lang === 'hi' ? 'मैप में देखें' : 'View on Map'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 font-mono">
              {lang === 'hi' ? 'लोकेशन स्टैंडबाय' : 'Location Standby'}
            </span>
          )}
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500 ml-1">
            NEO-6M UART
          </span>
        </div>
      </div>
    </div>
  );
}
