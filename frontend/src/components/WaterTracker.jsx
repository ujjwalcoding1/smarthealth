import React, { useState } from 'react';
import { Droplet, Plus, Check, Info, Users, Baby, UserCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export function WaterTracker({ waterData, onAddWater, lang, t }) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('adult'); // 'kids', 'adult', 'senior'

  // Dynamic targets based on age group
  const targets = {
    kids: 1400,
    adult: 2800,
    senior: 2000
  };

  const targetMl = targets[selectedAgeGroup] || 2800;
  const currentMl = waterData?.current_ml || 1600;
  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="health-card mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500 text-white shadow-sm">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t?.waterIntake || 'Daily Hydration Tracker'}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                35ml/kg Rule
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' 
                ? 'बच्चे, वयस्क और बुजुर्गों के लिए दैनिक जल सेवन दिशानिर्देश' 
                : 'Personalized daily water intake guidelines for Kids, Adults, and Seniors.'}
            </p>
          </div>
        </div>

        {/* Quick Add Water Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddWater(150)}
            className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
          >
            +150ml (Cup)
          </button>
          <button
            onClick={() => onAddWater(250)}
            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250ml</span>
          </button>
          <button
            onClick={() => onAddWater(500)}
            className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
          >
            +500ml (Bottle)
          </button>
        </div>
      </div>

      {/* Age Group Switcher Tabs */}
      <div className="flex items-center gap-2 my-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setSelectedAgeGroup('kids')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            selectedAgeGroup === 'kids'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'बच्चे (1-13 वर्ष)' : 'Kids (1-13 Yrs)'}</span>
        </button>

        <button
          onClick={() => setSelectedAgeGroup('adult')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            selectedAgeGroup === 'adult'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'वयस्क (18-64 वर्ष)' : 'Adults (18-64 Yrs)'}</span>
        </button>

        <button
          onClick={() => setSelectedAgeGroup('senior')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            selectedAgeGroup === 'senior'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'बुजुर्ग (65+ वर्ष)' : 'Old Age / Seniors (65+ Yrs)'}</span>
        </button>
      </div>

      {/* Progress Bar & Intake Volume */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 my-3">
        <div className="flex items-baseline justify-between mb-1.5 text-xs">
          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            {currentMl} / {targetMl} ml
          </span>
          <span className="font-extrabold text-sky-600 dark:text-sky-400">
            {percentage}% {lang === 'hi' ? 'पूरा हुआ' : 'Achieved'}
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-sky-400 to-sky-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Specific Detailed Instructions for Selected Age Group */}
      <div className="p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 bg-white dark:bg-slate-900/90 border-sky-200 dark:border-sky-900/60 shadow-sm">
        {selectedAgeGroup === 'kids' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5">
                <Baby className="w-4 h-4" />
                <span>{lang === 'hi' ? 'बच्चों के लिए जल सेवन निर्देश (Kids: 1-13 वर्ष)' : 'Hydration Instructions for Kids (1-13 Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                1.2L - 1.6L (5 - 6 Glasses)
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? 'किडनी विकास:' : 'Kidney Development:'}</strong> {lang === 'hi' ? 'बच्चों की किडनी अभी विकसित हो रही होती है, इसलिए एक साथ बहुत अधिक पानी पीने के बजाय पूरे दिन में घूंट-घूंट करके पिलाएं।' : 'Children have developing glomerular filtration. Encourage consistent sips throughout the day rather than sudden large gulps.'}</li>
              <li><strong>{lang === 'hi' ? 'खेलकूद के बाद:' : 'Post-Play Hydration:'}</strong> {lang === 'hi' ? 'खेलने और पसीना आने के बाद 1 गिलास पानी जरूर पिलाएं ताकि डिहाइड्रेशन और सिरदर्द से बचाव हो।' : 'Provide 1 full glass of water or electrolyte-infused fluid after active outdoor play to prevent heat exhaustion.'}</li>
              <li><strong>{lang === 'hi' ? 'मीठे पेय से बचें:' : 'Avoid Sugary Drinks:'}</strong> {lang === 'hi' ? 'पैकेज्ड फ्रूट जूस या कार्बोनेटेड सोडा के बजाय सादा पानी, नींबू पानी या नारियल पानी दें।' : 'Substitute plain water, buttermilk, or tender coconut water for packaged commercial fruit juices and sodas.'}</li>
            </ul>
          </>
        )}

        {selectedAgeGroup === 'adult' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'hi' ? 'वयस्कों के लिए जल सेवन निर्देश (Adults: 18-64 वर्ष)' : 'Hydration Instructions for Adults (18-64 Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                2.5L - 3.5L (10 - 12 Glasses)
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? '35ml/kg फॉर्मूला:' : '35ml/kg Rule:'}</strong> {lang === 'hi' ? 'अपने वजन को 35 से गुणा करें (जैसे 70 किग्रा व्यक्ति के लिए 70 × 35 = 2.45 लीटर पानी प्रतिदिन)।' : 'Optimal intake: Multiply your body weight (kg) by 35 ml (e.g. 70 kg × 35 = ~2.5 Liters/day baseline).'}</li>
              <li><strong>{lang === 'hi' ? 'सुबह का नियम:' : 'Morning Flush:'}</strong> {lang === 'hi' ? 'सुबह उठते ही खाली पेट 1 से 2 गिलास गुनगुना पानी पिएं, जिससे पेट और किडनी से टॉक्सिन्स साफ होते हैं।' : 'Drink 1 to 2 glasses of water upon waking to restore nocturnal hydration deficit and activate bowel motility.'}</li>
              <li><strong>{lang === 'hi' ? 'वर्कआउट व गर्मी:' : 'Exercise & Heat:'}</strong> {lang === 'hi' ? 'जिम, दौड़ने या गर्मी के मौसम में 500 से 1000 मिली अतिरिक्त पानी इलेक्ट्रोलाइट्स के साथ लें।' : 'Add 500ml - 1000ml for intense cardiovascular exercise or hot humid weather to compensate for sweat losses.'}</li>
            </ul>
          </>
        )}

        {selectedAgeGroup === 'senior' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>{lang === 'hi' ? 'बुजुर्गों के लिए जल सेवन निर्देश (Old Age: 65+ वर्ष)' : 'Hydration Instructions for Seniors (65+ Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                1.8L - 2.2L (7 - 9 Glasses)
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? 'प्यास का अहसास कम होना:' : 'Diminished Thirst Reflex:'}</strong> {lang === 'hi' ? 'उम्र बढ़ने पर मस्तिष्क में प्यास का अहसास कम हो जाता है। इसलिए प्यास लगने का इंतजार न करें, हर 1.5 से 2 घंटे में आधा-आधा गिलास गुनगुना पानी पिएं।' : 'Aging blunts hypothalamic osmoreceptor thirst cues. Seniors rarely feel thirsty even when clinically dehydrated. Drink on a fixed clock schedule.'}</li>
              <li><strong>{lang === 'hi' ? 'रात में सावधानी:' : 'Nighttime Precaution:'}</strong> {lang === 'hi' ? 'सोने से 1.5 घंटे पहले बहुत अधिक पानी न पिएं ताकि रात में बार-बार पेशाब जाने (Nocturia) और गिरने (Fall) का जोखिम न रहे।' : 'Taper fluid intake 1.5 hours before bedtime to reduce nocturia and night-time bathroom fall hazards.'}</li>
              <li><strong>{lang === 'hi' ? 'मेडिकल सीमा (Heart / Kidney):' : 'Medical Restriction Note:'}</strong> {lang === 'hi' ? 'यदि हृदय (Heart Failure) या गुर्दे (CKD) की बीमारी है, तो डॉक्टर द्वारा बताई गई सीमित मात्रा (Fluid Restriction) का ही पालन करें।' : 'Strictly adhere to your cardiologist/nephrologist prescribed fluid limits if congestive heart failure or renal failure is present.'}</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
