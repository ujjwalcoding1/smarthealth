import React, { useState } from 'react';
import { Moon, Sparkles, CheckCircle2, Clock, Baby, UserCheck, HeartHandshake, ShieldCheck } from 'lucide-react';

export function SleepTracker({ sleepData, lang, t }) {
  const [selectedAge, setSelectedAge] = useState('adult'); // 'kids', 'adult', 'senior'

  const duration = sleepData?.last_night_duration_hours || 7.4;
  const score = sleepData?.sleep_score || 86;
  const deep = sleepData?.deep_sleep_hours || 2.1;
  const rem = sleepData?.rem_sleep_hours || 1.8;
  const light = sleepData?.light_sleep_hours || 3.5;

  return (
    <div className="health-card mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600 text-white shadow-sm">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t?.sleepQuality || 'Sleep Analysis & Restorative Health'}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                Score: {score}/100
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' 
                ? 'बच्चे, वयस्क और बुजुर्गों के लिए आवश्यक नींद के घंटे और वैज्ञानिक लाभ' 
                : 'Evidence-based sleep duration targets & circadian guidelines for Kids, Adults, and Seniors.'}
            </p>
          </div>
        </div>

        {/* Age Group Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedAge('kids')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              selectedAge === 'kids'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'बच्चे' : 'Kids'}</span>
          </button>

          <button
            onClick={() => setSelectedAge('adult')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              selectedAge === 'adult'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'वयस्क' : 'Adults'}</span>
          </button>

          <button
            onClick={() => setSelectedAge('senior')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              selectedAge === 'senior'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'बुजुर्ग' : 'Seniors'}</span>
          </button>
        </div>
      </div>

      {/* 4 Sleep Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10.5px] text-slate-500 block">Total Sleep</span>
          <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {duration} hrs
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal Range</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10.5px] text-slate-500 block">Deep Sleep (N3)</span>
          <span className="text-xl font-bold font-mono text-violet-600 dark:text-violet-400">
            {deep} hrs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cellular Repair</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10.5px] text-slate-500 block">REM Dream</span>
          <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
            {rem} hrs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cognitive Reset</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-center border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10.5px] text-slate-500 block">Sleep Resting HR</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            61.2 BPM
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy Nocturnal Dip</span>
        </div>
      </div>

      {/* Age-Specific Sleep Duration Guidelines */}
      <div className="p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 bg-white dark:bg-slate-900/90 border-violet-200 dark:border-violet-900/60 shadow-sm">
        {selectedAge === 'kids' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1.5">
                <Baby className="w-4 h-4" />
                <span>{lang === 'hi' ? 'बच्चों के लिए आवश्यक नींद (Kids: 3 - 12 वर्ष)' : 'Sleep Guidelines for Children & Kids (3 - 12 Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                9 - 12 Hours / Night
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? 'शारीरिक विकास (HGH):' : 'Growth Hormone Release:'}</strong> {lang === 'hi' ? 'गहरी नींद (Slow-Wave NREM) के दौरान बच्चों के शरीर में ह्यूमन ग्रोथ हार्मोन स्रावित होता है, जिससे लंबाई, हड्डियों और मांसपेशियों का विकास होता है।' : 'Peak secretion of Human Growth Hormone (HGH) occurs during slow-wave deep sleep, vital for physical stature, bone density, and muscle growth.'}</li>
              <li><strong>{lang === 'hi' ? 'याददाश्त और एकाग्रता:' : 'Cognitive Consolidation:'}</strong> {lang === 'hi' ? '9-11 घंटे की नींद से बच्चों की पढ़ाई में एकाग्रता, याददाश्त और दिमागी चुस्ती बढ़ती है।' : 'Adequate sleep enhances synaptic plasticity, emotional stability, school focus, and prevents ADHD-like behavioral symptoms.'}</li>
              <li><strong>{lang === 'hi' ? 'स्क्रीन टाइम का नियम:' : 'Screen Curfew:'}</strong> {lang === 'hi' ? 'सोने से 1 घंटा पहले मोबाइल या टीवी स्क्रीन पूरी तरह बंद कर दें ताकि मेलाटोनिन हार्मोन बाधित न हो।' : 'Turn off tablets and television at least 60 minutes before bedtime; blue light delays melatonin onset by up to 2 hours.'}</li>
            </ul>
          </>
        )}

        {selectedAge === 'adult' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'hi' ? 'वयस्कों के लिए आवश्यक नींद (Adults: 18 - 64 वर्ष)' : 'Sleep Guidelines for Adults (18 - 64 Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                7 - 9 Hours / Night
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? 'डीप स्लीप (Deep Sleep):' : 'Glymphatic Brain Detox:'}</strong> {lang === 'hi' ? 'रात में कम से कम 1.5 से 2 घंटे की गहरी नींद मस्तिष्क से टॉक्सिन्स (Beta-Amyloid) को साफ करती है और अल्जाइमर से बचाती है।' : 'The brain’s glymphatic clearance system flushes metabolic neurotoxins during Deep N3 sleep, significantly reducing long-term neurodegenerative risks.'}</li>
              <li><strong>{lang === 'hi' ? 'हार्ट और बीपी रिकवरी:' : 'Cardiovascular Dipping:'}</strong> {lang === 'hi' ? 'नींद के दौरान हृदय गति और रक्तचाप 10-20% कम (Dipping) होते हैं, जिससे हृदय की धमनियों को आराम मिलता है।' : 'Normal nocturnal BP dipping (10-20% drop) allows the heart and endothelial vessels to recover. Chronic short sleep (< 6h) increases stroke and hypertension risk by 40%.'}</li>
              <li><strong>{lang === 'hi' ? 'कैफीन कटऑफ:' : 'Caffeine Cutoff Rule:'}</strong> {lang === 'hi' ? 'दोपहर 2 बजे के बाद कॉफी या चाय न पिएं। कमरे का तापमान 20°C - 22°C रखें।' : 'Avoid caffeinated beverages after 2:00 PM (caffeine has a 6-hour half-life). Maintain bedroom ambient temperature at 20°C - 22°C.'}</li>
            </ul>
          </>
        )}

        {selectedAge === 'senior' && (
          <>
            <div className="flex items-center justify-between">
              <strong className="text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>{lang === 'hi' ? 'बुजुर्गों के लिए आवश्यक नींद (Seniors: 65+ वर्ष)' : 'Sleep Guidelines for Seniors (65+ Yrs)'}</span>
              </strong>
              <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                7 - 8 Hours / Night
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
              <li><strong>{lang === 'hi' ? 'सर्कैडियन बदलाव:' : 'Circadian Shift:'}</strong> {lang === 'hi' ? 'उम्र बढ़ने के साथ शाम को जल्दी नींद आने लगती है और सुबह जल्दी आंख खुलती है। नियमित समय पर सोएं और जागें।' : 'Aging naturally shifts circadian phases earlier. Maintain strict wake and bed schedules to preserve sleep efficiency.'}</li>
              <li><strong>{lang === 'hi' ? 'दिन में लंबी नींद न लें:' : 'Limit Daytime Napping:'}</strong> {lang === 'hi' ? 'दोपहर में 20-30 मिनट से अधिक न सोएं ताकि रात की नींद में रुकावट न आए।' : 'Cap daytime power naps at 20-30 minutes and avoid late-afternoon sleeping to preserve sleep drive at night.'}</li>
              <li><strong>{lang === 'hi' ? 'सुबह की धूप लें:' : 'Morning Sunlight Therapy:'}</strong> {lang === 'hi' ? 'सुबह 15-20 मिनट हल्की धूप में बैठें, जिससे रात में मेलाटोनिन का उत्पादन सही रहता है।' : '20 minutes of outdoor morning sunlight calibrates pineal melatonin production and improves sleep quality naturally.'}</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
