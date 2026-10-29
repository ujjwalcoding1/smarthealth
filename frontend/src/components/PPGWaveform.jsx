import React, { useRef, useEffect } from 'react';
import { Activity, Heart } from 'lucide-react';

export function PPGWaveform({ bpm = 75, isSimulated = false, zone = 'GREEN', t }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 600);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 140;
      }
    };
    window.addEventListener('resize', handleResize);

    const points = [];
    const maxPoints = Math.floor(width / 2);
    for (let i = 0; i < maxPoints; i++) {
      points.push(height / 2);
    }

    let tVal = 0;
    // Calculate pulse speed from BPM (60 BPM = 1 beat per second)
    const effectiveBpm = bpm > 30 ? bpm : 72;
    const beatFrequency = (effectiveBpm / 60) * 0.05;

    const render = () => {
      tVal += beatFrequency;

      // Mathematical approximation of PPG pulse (systolic peak + dicrotic notch + diastolic peak)
      const phase = (tVal % 1) * Math.PI * 2;
      let wave = 0;

      // Systolic peak
      if (phase < Math.PI * 0.8) {
        wave = Math.sin(phase / 0.8 * Math.PI) * 45;
      } else if (phase >= Math.PI * 0.8 && phase < Math.PI * 1.3) {
        // Dicrotic notch
        const dicroticPhase = (phase - Math.PI * 0.8) / (Math.PI * 0.5) * Math.PI;
        wave = Math.sin(dicroticPhase) * 18;
      } else {
        wave = Math.sin(phase) * 5;
      }

      // Add slight biological jitter
      const jitter = (Math.random() - 0.5) * 2;
      const y = height / 2 - wave + jitter;

      points.push(y);
      if (points.length > maxPoints) {
        points.shift();
      }

      // Draw Wave
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = zone === 'RED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)';
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

      // Trace line
      ctx.beginPath();
      const lineColor = zone === 'RED' ? '#ef4444' : zone === 'YELLOW' ? '#f59e0b' : '#10b981';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (let i = 0; i < points.length; i++) {
        const xPos = i * (width / maxPoints);
        if (i === 0) {
          ctx.moveTo(xPos, points[i]);
        } else {
          ctx.lineTo(xPos, points[i]);
        }
      }
      ctx.stroke();

      // Glowing pulse head
      const lastX = (points.length - 1) * (width / maxPoints);
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
  }, [bpm, zone]);

  return (
    <div className="health-card mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {t.livePulseWave}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-heartbeat" />
            <span>{bpm ? bpm.toFixed(1) : '--'} BPM</span>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-500 font-mono">
            MAX30102 100Hz Bus
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-950 rounded-xl overflow-hidden shadow-inner p-1">
        <canvas ref={canvasRef} className="w-full block" />
      </div>
    </div>
  );
}
