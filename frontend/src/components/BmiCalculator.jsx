import React, { useState } from 'react';
import { Scale, Calculator } from 'lucide-react';

export function BmiCalculator({ lang, t }) {
  const [height, setHeight] = useState(174);
  const [weight, setWeight] = useState(72);

  const hM = height / 100;
  const bmi = (weight / (hM * hM)).toFixed(1);

  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
    if (val < 25) return { label: 'Normal / Healthy', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const cat = getBmiCategory(parseFloat(bmi));

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              BMI & Body Metrics
            </h3>
            <span className="text-[11px] text-slate-500">
              Height, Weight, Body Mass Index & BMR
            </span>
          </div>
        </div>

        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 ${cat.color}`}>
          {cat.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Height: {height} cm</label>
          <input
            type="range"
            min="120"
            max="210"
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1">Weight: {weight} kg</label>
          <input
            type="range"
            min="40"
            max="140"
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center">
          <span className="text-[10.5px] text-slate-500 block">BMI Score</span>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {bmi}
          </span>
          <span className="text-[10px] text-slate-400 block">Ideal: 18.5 - 24.9</span>
        </div>
      </div>
    </div>
  );
}
