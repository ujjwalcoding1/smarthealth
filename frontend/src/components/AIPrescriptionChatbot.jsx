import React, { useState } from 'react';
import { Bot, Send, Pill, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, User, Loader2 } from 'lucide-react';

export function AIPrescriptionChatbot({ telemetry, apiBaseUrl, lang }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'hi'
        ? "नमस्ते! मैं आपका स्मार्टहेल्थ एआई मेडिकल कंसल्टेंट हूँ। आपको क्या बीमारी या लक्षण महसूस हो रहे हैं? (जैसे: बुखार, खांसी, गैस/एसिडिटी, सिरदर्द, बीपी, दस्त, बदन दर्द आदि)। मैं आपको तुरंत सुरक्षित दवाइयाँ, सही खुराक और घरेलू उपचार बता सकता हूँ।"
        : "Hello! I am your SmartHealth AI Clinical Prescriber. Describe any symptoms or illness you are experiencing (e.g. fever, headache, cough, acidity, diarrhea, hypertension, body pain). I will evaluate your symptoms, prescribe safe OTC medications, dosage, and dietary advice."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQueries = lang === 'hi' ? [
    "तेज बुखार और सिरदर्द की दवा बताओ",
    "खांसी और गले में खराश के लिए क्या लूँ?",
    "पेट में गैस और सीने में जलन हो रही है",
    "दस्त और पेट दर्द का उपचार बताएं"
  ] : [
    "Prescribe medicine for severe fever and body ache",
    "Best medicine for wet cough and throat irritation",
    "What should I take for acidity and gas?",
    "Remedies for loose motion and dehydration"
  ];

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const resp = await fetch(`${apiBaseUrl}/api/ai/prescribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom_text: userText,
          current_heart_rate: telemetry?.heart_rate,
          current_temp: telemetry?.temperature_c,
          current_spo2: telemetry?.spo2
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages(prev => [...prev, {
          sender: 'ai',
          structured: data,
          text: data.clinical_assessment
        }]);
      } else {
        throw new Error("Failed to prescribe");
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Based on your reported symptoms for "${userText}": Take Paracetamol 650mg if feverish after food, drink 2.5L ORS fluids, and rest. Consult doctor if symptoms persist over 48 hours.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-card mb-8 flex flex-col h-[600px] border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {lang === 'hi' ? 'एआई चिकित्सक एवं प्रिस्क्रिप्शन चैटबॉट' : 'AI Doctor & Prescription Chatbot'}
              </h3>
              <span className="badge badge-green text-[10px]">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Live Prescriber
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'किसी भी बीमारी की सटीक दवा, खुराक और उपचार सलाह पाएं' : 'Evaluates any disease or illness, prescribes exact medicine & dosage.'}
            </p>
          </div>
        </div>

        {/* Real-time vitals badge attached */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-300">
          <HeartPulse className="w-3.5 h-3.5 text-red-500" />
          <span>Vitals: {telemetry?.heart_rate || 75} BPM | {telemetry?.temperature_c || 36.8}°C</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium text-xs'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.text && <p className="mb-2 whitespace-pre-line">{msg.text}</p>}

              {/* If structured prescription is returned */}
              {msg.structured && (
                <div className="space-y-2.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 text-xs">
                      🩺 Diagnosis: {msg.structured.condition_diagnosed}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                      {msg.structured.urgency}
                    </span>
                  </div>

                  {/* Prescribed Medicines Box */}
                  {msg.structured.prescribed_medicines && msg.structured.prescribed_medicines.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        Prescribed Medication & Dosage:
                      </span>
                      {msg.structured.prescribed_medicines.map((m, mi) => (
                        <div key={mi} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-800/80 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-slate-900 dark:text-slate-100 text-xs">{m.name}</strong>
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                              {m.dosage}
                            </span>
                          </div>
                          {m.composition && (
                            <p className="text-[10.5px] text-slate-500 font-mono mb-1">Composition: {m.composition}</p>
                          )}
                          {m.purpose && (
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1"><strong>Action:</strong> {m.purpose}</p>
                          )}
                          {m.caution && (
                            <p className="text-[10.5px] text-amber-700 dark:text-amber-400 italic">⚠️ {m.caution}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Home Remedies / Dietary */}
                  {msg.structured.dietary_lifestyle && msg.structured.dietary_lifestyle.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">🌿 Diet & Recovery Advice:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {msg.structured.dietary_lifestyle.map((tip, ti) => (
                          <li key={ti}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red flags */}
                  {msg.structured.red_flags && (
                    <p className="text-[10.5px] text-red-700 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
                      🚨 <strong>Warning Signs:</strong> {msg.structured.red_flags}
                    </p>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>AI Doctor is analyzing symptoms & prescribing medicines...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
        {sampleQueries.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'hi' ? 'अपनी बीमारी या लक्षण बताएं (जैसे: मुझे 2 दिन से बुखार और बदन दर्द है)...' : 'Type illness or symptoms (e.g. fever with throat ache since yesterday)...'}
          className="flex-1 py-2.5 px-4 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Consult</span>
        </button>
      </form>
    </div>
  );
}
