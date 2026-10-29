import React from 'react';
import { Droplet, Plus, Check } from 'lucide-react';

export function WaterTracker({ waterData, onAddWater, lang, t }) {
  const currentMl = waterData?.current_ml || 1600;
  const targetMl = waterData?.target_ml || 2500;
  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500 text-white shadow-sm">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.waterIntake}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'दैनिक जल सेवन और इलेक्ट्रोलाइट संतुलन' : 'Hydration monitor & dehydration prevention'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onAddWater(250)}
          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addWater}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-baseline justify-between mb-1.5 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentMl} / {targetMl} ml
            </span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">
              {percentage}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-sky-400 to-sky-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {lang === 'hi' 
              ? 'हाइड्रेशन से हृदय गति और रक्तचाप स्थिर रहता है। प्रतिदिन कम से कम 8-10 गिलास पानी पिएं।' 
              : 'Proper hydration stabilizes resting heart rate and reduces tachycardia risk. Aim for 8-10 glasses daily.'}
          </p>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddWater(150)}
            className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
          >
            +150ml (Cup)
          </button>
          <button
            onClick={() => onAddWater(500)}
            className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
          >
            +500ml (Bottle)
          </button>
        </div>
      </div>
    </div>
  );
}
