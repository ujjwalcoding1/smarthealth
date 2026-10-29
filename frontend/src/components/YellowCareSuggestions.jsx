import React from 'react';
import { Pill, AlertCircle, HeartHandshake, Coffee, Wind, ShieldAlert, CheckCircle, Info, Clock, Plus } from 'lucide-react';

export function YellowCareSuggestions({ evaluation, onAddMedicine, lang, t }) {
  if (!evaluation || evaluation.zone !== 'YELLOW') {
    return null;
  }

  const medicines = evaluation.medicine_advice || [];
  const recommendations = evaluation.recommendations || [];
  const dietary = evaluation.dietary_tips || [];

  return (
    <div id="yellow-recommendations" className="health-card border-amber-300 dark:border-amber-700 bg-amber-500/5 mb-6 shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-800 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-amber-900 dark:text-amber-200">
              {t.yellowSuggestionsTitle}
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {lang === 'hi' 
                ? 'औसत स्वास्थ्य स्थिति के लिए चिकित्सकीय सुझाव, अनुशंसित दवाइयाँ और सावधानियाँ' 
                : 'Clinical recommendations, suggested OTC medications, and comfort protocols for moderate condition.'}
            </p>
          </div>
        </div>

        <span className="badge badge-yellow">
          Average Zone Care Protocol
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Recommended Medicines */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <Pill className="w-4 h-4 text-amber-600" />
              <span>{t.recommendedMeds}</span>
            </div>

            {medicines.length === 0 ? (
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? 'कोई आपातकालीन दवा की आवश्यकता नहीं है।' : 'No emergency medicine required. Maintain hydration.'}
              </p>
            ) : (
              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-slate-900/60 border border-amber-200/80 dark:border-amber-900/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span>{med.name}</span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono">
                        {med.dosage}
                      </span>
                    </div>
                    {med.purpose && (
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                        <strong className="text-amber-800 dark:text-amber-400">
                          {lang === 'hi' ? 'कारण:' : 'Purpose:'}
                        </strong> {med.purpose}
                      </p>
                    )}
                    {med.caution && (
                      <p className="text-red-700 dark:text-red-400 text-[10.5px] italic">
                        ⚠️ {med.caution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
            <span>{lang === 'hi' ? 'भोजन के बाद ही दवा लें' : 'Take after light meal'}</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">{lang === 'hi' ? 'डॉक्टर की पर्ची का ध्यान रखें' : 'Follow Rx'}</span>
          </div>
        </div>

        {/* 2. Immediate Lifestyle & Posture Guidance */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{t.lifestyleTips}</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {recommendations.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? '30 मिनट बाद सेंसर पर तापमान पुनः जांचें' : 'Recheck vitals on sensor in 30 mins'}</span>
          </div>
        </div>

        {/* 3. Nutrition & Hydration Guidance */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <Coffee className="w-4 h-4 text-sky-600" />
              <span>{t.dietaryTips}</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {dietary.map((diet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <span>{diet}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                <span className="font-bold text-amber-700 dark:text-amber-400">⚡ Note:</span>
                <span>{lang === 'hi' ? 'भारी व मसालेदार भोजन से बचें। सादा दलिया, खिचड़ी या सूप पिएं।' : 'Avoid oily/spicy heavy meals. Prefer warm clear soup or khichdi.'}</span>
              </li>
            </ul>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{lang === 'hi' ? 'हाइड्रेशन लक्ष्य: 3 लीटर' : 'Hydration target: 3.0 L'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{lang === 'hi' ? 'ओआरएस / नारियल पानी' : 'ORS / Coconut water'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
