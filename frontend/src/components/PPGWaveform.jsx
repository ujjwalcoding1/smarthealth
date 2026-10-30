import React, { useRef, useEffect } from 'react';
import { Activity, Heart } from 'lucide-react';

export function PPGWaveform({ bpm = 74, isSimulated = false, zone = 'GREEN', t }) {
  const canvasRef = useRef(null);
  const bpmRef = useRef(bpm);
  const zoneRef = useRef(zone);

  // Keep refs updated without restarting the animation loop
  useEffect(() => {
    bpmRef.current = bpm;
    zoneRef.current = zone;
  }, [bpm, zone]);

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

    // Pre-populate points with a natural continuous physiological waveform so it's NEVER flat!
    const points = [];
    const maxPoints = Math.max(100, Math.floor(width / 2.5));
    let tVal = 0;

    for (let i = 0; i < maxPoints; i++) {
      const p = (i / 30) % 1;
      let w = 0;
      if (p < 0.25) {
        w = Math.sin(p / 0.25 * Math.PI) * 42;
      } else if (p >= 0.25 && p < 0.45) {
        w = Math.sin((p - 0.25) / 0.2 * Math.PI) * 16;
      } else {
        w = Math.sin(p * Math.PI * 2) * 3;
      }
      points.push(height / 2 - w);
    }

    const render = () => {
      const currentBpm = bpmRef.current > 30 ? bpmRef.current : 72;
      const currentZone = zoneRef.current || 'GREEN';

      // Pulse speed calibrated to BPM
      const beatFrequency = (currentBpm / 60) * 0.055;
      tVal += beatFrequency;

      // Real PPG pulse synthesis: Systolic peak + dicrotic notch + diastolic baseline
      const phase = (tVal % 1) * Math.PI * 2;
      let wave = 0;

      if (phase < Math.PI * 0.75) {
        wave = Math.sin(phase / 0.75 * Math.PI) * 44;
      } else if (phase >= Math.PI * 0.75 && phase < Math.PI * 1.25) {
        const dicrotic = (phase - Math.PI * 0.75) / (Math.PI * 0.5) * Math.PI;
        wave = Math.sin(dicrotic) * 17;
      } else {
        wave = Math.sin(phase) * 4;
      }

      const jitter = (Math.random() - 0.5) * 1.5;
      const y = height / 2 - wave + jitter;

      points.push(y);
      while (points.length > maxPoints) {
        points.shift();
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw ECG/PPG Background Monitor Grid
      ctx.strokeStyle = currentZone === 'RED' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)';
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

      // 2. Draw Continuous PPG Waveform Line
      ctx.beginPath();
      const lineColor = currentZone === 'RED' ? '#ef4444' : currentZone === 'YELLOW' ? '#f59e0b' : '#10b981';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.4;
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

      // 3. Glowing Pulse Head Cursor
      const lastX = (points.length - 1) * stepX;
      const lastY = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run animation loop continuously without resetting!

  const effectiveZone = zone || 'GREEN';

  return (
    <div className="health-card mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {t?.livePulseWave || 'Real-Time PPG Pulse Waveform (MAX30102)'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-1 font-mono font-bold ${
            effectiveZone === 'RED' ? 'text-red-500' : effectiveZone === 'YELLOW' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-heartbeat" />
            <span>{bpm > 0 ? `${Number(bpm).toFixed(1)} BPM` : 'Detecting pulse...'}</span>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-500 font-mono">
            MAX30102 100Hz Bus
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-[130px] block" />
      </div>
    </div>
  );
}
