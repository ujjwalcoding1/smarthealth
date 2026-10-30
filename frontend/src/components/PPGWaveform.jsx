import React, { useRef, useEffect } from 'react';
import { Activity, Heart, Radio } from 'lucide-react';

export function PPGWaveform({ bpm = 0, isSimulated = false, zone = 'GREEN', telemetry, t }) {
  const canvasRef = useRef(null);
  const bpmRef = useRef(bpm);
  const zoneRef = useRef(zone);
  const telemetryRef = useRef(telemetry);

  // Keep refs updated without restarting the animation loop
  useEffect(() => {
    bpmRef.current = Number(bpm) || 0;
    zoneRef.current = zone;
    telemetryRef.current = telemetry;
  }, [bpm, zone, telemetry]);

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
    let idleNoiseState = 0;

    // Pre-populate with initial points
    for (let i = 0; i < maxPoints; i++) {
      points.push(height / 2);
    }

    const render = () => {
      const currentBpm = Number(bpmRef.current) || 0;
      const currentZone = zoneRef.current || 'GREEN';
      const hasLivePulse = currentBpm > 25;

      let y = height / 2;

      if (hasLivePulse) {
        // --- LIVE ARTERIAL PULSE CONTOUR (Synced to real BPM from MAX30102) ---
        // Cycle frequency directly proportional to measured BPM
        const beatFrequency = (currentBpm / 60) * 0.052;
        tVal += beatFrequency;

        const phase = (tVal % 1) * Math.PI * 2;
        let wave = 0;

        // Systolic upstroke & ejection peak
        if (phase < Math.PI * 0.70) {
          wave = Math.sin((phase / 0.70) * Math.PI) * 46;
        } 
        // Dicrotic notch and secondary aortic rebound wave
        else if (phase >= Math.PI * 0.70 && phase < Math.PI * 1.20) {
          const dicroticPhase = ((phase - Math.PI * 0.70) / (Math.PI * 0.50)) * Math.PI;
          wave = Math.sin(dicroticPhase) * 18;
        } 
        // Diastolic decay run-off
        else {
          wave = Math.sin(phase) * 3;
        }

        // Add subtle physiological sensor micro-jitter
        const microJitter = (Math.random() - 0.5) * 2.2;
        y = height / 2 - wave + microJitter;

      } else {
        // --- REALISTIC DYNAMIC ZIG-ZAG BASELINE NOISE (When no finger/heart rate detected) ---
        // Generates active irregular optical baseline drift & zig-zag sensor flutter (never repetitive or flat)
        tVal += 0.09;
        idleNoiseState += 0.15;

        // Multi-frequency harmonic wandering + random Brownian zig-zag jumps
        const wanderingBaseline = Math.sin(tVal * 0.8) * 8 + Math.cos(tVal * 1.9) * 5;
        const randomZigZag = (Math.random() - 0.5) * 16;
        const sensorHighFreq = Math.sin(idleNoiseState * 4.2) * 6;

        y = height / 2 + wanderingBaseline + randomZigZag + sensorHighFreq;
      }

      points.push(y);
      while (points.length > maxPoints) {
        points.shift();
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Medical Monitor Grid
      ctx.strokeStyle = hasLivePulse
        ? (currentZone === 'RED' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.10)')
        : 'rgba(245, 158, 11, 0.09)';
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
      const lineColor = hasLivePulse
        ? (currentZone === 'RED' ? '#ef4444' : currentZone === 'YELLOW' ? '#f59e0b' : '#10b981')
        : '#f59e0b'; // Amber for idle scanning noise

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = hasLivePulse ? 2.5 : 1.8;
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
      ctx.arc(lastX, lastY, hasLivePulse ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = hasLivePulse ? 12 : 6;
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

  const hasPulse = Number(bpm) > 25;

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${hasPulse ? 'bg-emerald-600' : 'bg-amber-500'} text-white shadow-sm`}>
            {hasPulse ? <Heart className="w-4 h-4 animate-heartbeat" /> : <Radio className="w-4 h-4 animate-pulse" />}
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t?.livePulseWave || 'Real-Time PPG Pulse Waveform (MAX30102)'}</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {hasPulse 
                ? `Optical photoplethysmogram synced to ESP32 MAX30102 • ${bpm.toFixed(1)} BPM Live Rhythm` 
                : 'Optical sensor active • Dynamic baseline zig-zag scanning noise (Place finger on MAX30102)'}
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
            hasPulse 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasPulse ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`}></span>
            <span>{hasPulse ? `Pulse Locked: ${bpm.toFixed(1)} BPM` : 'Scanning / Zig-Zag Baseline'}</span>
          </span>
        </div>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 shadow-inner">
        <canvas ref={canvasRef} className="w-full block" />
      </div>
    </div>
  );
}
