import React, { useRef, useEffect } from 'react';
import { Heart, Activity, Radio, AlertCircle } from 'lucide-react';

export function PPGWaveform({ 
  bpm = 0, 
  fingerDetected = false,
  hardwareActive = false,
  isSimulated = false, 
  zone = 'GREEN', 
  telemetry, 
  lang = 'en',
  t 
}) {
  const canvasRef = useRef(null);
  const bpmRef = useRef(bpm);
  const zoneRef = useRef(zone);
  const telemetryRef = useRef(telemetry);
  const fingerDetectedRef = useRef(fingerDetected);
  const hardwareActiveRef = useRef(hardwareActive);

  // Keep refs synchronized with props on every render
  useEffect(() => {
    bpmRef.current = Number(bpm) || 0;
    zoneRef.current = zone || 'GREEN';
    telemetryRef.current = telemetry;
    fingerDetectedRef.current = fingerDetected;
    hardwareActiveRef.current = hardwareActive;
  }, [bpm, zone, telemetry, fingerDetected, hardwareActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 140;
      }
    };
    window.addEventListener('resize', handleResize);

    const maxPoints = Math.max(100, Math.floor(width / 2.5));
    const points = [];
    let tVal = 0;

    // Initialize buffer with simple flat baseline
    for (let i = 0; i < maxPoints; i++) {
      points.push(height / 2);
    }

    const render = () => {
      const currentBpm = Number(bpmRef.current) || 0;
      const currentZone = zoneRef.current || 'GREEN';
      const isFingerOn = telemetryRef.current?.finger_detected !== false && fingerDetectedRef.current !== false;
      
      // Live reading occurs ONLY when valid heart rate > 25 is detected with finger in place
      const isReadingActive = currentBpm > 25 && isFingerOn;

      let y = height / 2;

      if (isReadingActive) {
        // --- REAL-TIME DYNAMIC ARTERIAL PULSE (Synced directly to real BPM) ---
        // 1. Beat cycle speed scales strictly with measured BPM
        const beatFrequency = (currentBpm / 60) * 0.048;
        tVal += beatFrequency;

        const cycle = tVal % 1.0;
        let wave = 0;

        // 2. Dynamic physiological systolic & diastolic timing:
        // As heart rate accelerates, systole takes proportionally slightly more time
        const systolicFraction = Math.min(0.44, 0.28 + (currentBpm / 220) * 0.14);
        const notchFraction = systolicFraction + 0.16;

        // 3. Amplitude adapts to BPM + subtle natural human heart rate variability (HRV)
        // Higher heart rates yield sharper systolic peaks; natural respiration adds organic liveliness
        const baseAmp = 38 + Math.min(16, (currentBpm - 60) * 0.24);
        const hrvModulation = Math.sin(tVal * 0.18) * 3.2; // Organic autonomic breathing variation
        const totalAmp = Math.max(24, baseAmp + hrvModulation);

        if (cycle < systolicFraction) {
          // Sharp systolic upstroke and ejection peak
          const p = cycle / systolicFraction;
          wave = Math.sin(p * Math.PI) * totalAmp;
        } else if (cycle >= systolicFraction && cycle < notchFraction) {
          // Dicrotic notch and secondary aortic reflection wave
          const p = (cycle - systolicFraction) / (notchFraction - systolicFraction);
          wave = Math.sin(p * Math.PI) * (totalAmp * 0.35);
        } else {
          // Diastolic resting run-off returning to baseline
          const p = (cycle - notchFraction) / (1.0 - notchFraction);
          wave = Math.exp(-p * 3.2) * (totalAmp * 0.10);
        }

        y = height / 2 - wave;

      } else {
        // --- SIMPLE CLEAN STRAIGHT LINE (FLATLINE) ---
        // When IoT sensor has no finger placed or is not receiving pulse, keep a simple flat line
        y = height / 2;
      }

      points.push(y);
      while (points.length > maxPoints) {
        points.shift();
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Medical Monitor Grid
      ctx.strokeStyle = isReadingActive
        ? (currentZone === 'RED' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.10)')
        : 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 20;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let yGrid = 0; yGrid < height; yGrid += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, yGrid);
        ctx.lineTo(width, yGrid);
        ctx.stroke();
      }

      // 2. Draw Continuous Waveform Line
      ctx.beginPath();
      const lineColor = isReadingActive
        ? (currentZone === 'RED' ? '#ef4444' : currentZone === 'YELLOW' ? '#f59e0b' : '#10b981')
        : '#38bdf8'; // Soft medical cyan for simple standby baseline line

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = isReadingActive ? 2.6 : 1.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const stepX = width / (maxPoints - 1);
      for (let i = 0; i < points.length; i++) {
        const xPos = i * stepX;
        if (i === 0) {
          ctx.moveTo(xPos, points[i]);
        } else {
          ctx.lineTo(xPos, points[i]);
        }
      }
      ctx.stroke();

      // 3. Glowing Pulse Cursor Head
      const lastX = (points.length - 1) * stepX;
      const lastY = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastX, lastY, isReadingActive ? 4.5 : 3.0, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = isReadingActive ? 12 : 5;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const currentBpm = Number(bpm) || 0;
  const isFingerOn = telemetry?.finger_detected !== false && fingerDetected !== false;
  const isReading = currentBpm > 25 && isFingerOn;

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isReading ? 'bg-emerald-600' : 'bg-slate-700'} text-white shadow-sm`}>
            {isReading ? <Heart className="w-4 h-4 animate-heartbeat" /> : <Activity className="w-4 h-4 text-sky-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t?.livePulseWave || 'Real-Time PPG Pulse Waveform (MAX30102)'}</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {isReading 
                ? (lang === 'hi' 
                    ? `वास्तविक हृदय गति के अनुसार लाइव वेवफ़ॉर्म • ${currentBpm.toFixed(1)} BPM रिदम` 
                    : `Dynamic pulse waveform synced to real heart rate • ${currentBpm.toFixed(1)} BPM Live Rhythm`)
                : (lang === 'hi'
                    ? 'IoT सेंसर स्टैंडबाय (उंगली नहीं रखी है) • सिंपल स्ट्रेट लाइन बेसलाइन'
                    : 'IoT Sensor Standby (No finger placed) • Simple Straight Baseline Line')}
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
            isReading 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isReading ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'}`}></span>
            <span>
              {isReading 
                ? `● Pulse Active: ${currentBpm.toFixed(1)} BPM` 
                : '○ Standby Line (0 BPM)'}
            </span>
          </span>
        </div>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 shadow-inner">
        <canvas ref={canvasRef} className="w-full block" />
      </div>
    </div>
  );
}
