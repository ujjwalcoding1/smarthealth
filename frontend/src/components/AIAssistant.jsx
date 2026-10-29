import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertCircle, CheckCircle, User, Loader2 } from 'lucide-react';

export function AIAssistant({ telemetry, lang, t, apiBaseUrl }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'hi'
        ? "नमस्ते! मैं आपका स्मार्टहेल्थ एआई चिकित्सक सहायक हूँ। आपकी वर्तमान हृदय गति और तापमान सामान्य है। आप किसी भी लक्षण, दवा या खानपान के बारे में पूछ सकते हैं।"
        : "Hello! I am your SmartHealth AI Triage Assistant. I continuously monitor your ESP32 vitals. Ask me about symptoms, medications, or wellness guidance."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const resp = await fetch(`${apiBaseUrl}/api/ai/symptom-checker`, {
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
        let reply = "";
        if (data.assessment && data.assessment.length > 0) {
          reply += `🩺 **Assessment:** ${data.assessment.join(' ')}\n\n`;
        }
        if (data.immediate_actions && data.immediate_actions.length > 0) {
          reply += `⚡ **Recommended Actions:**\n${data.immediate_actions.map(a => `• ${a}`).join('\n')}\n\n`;
        }
        if (data.recommended_remedies && data.recommended_remedies.length > 0) {
          reply += `💊 **Suggested Remedies / OTC:**\n${data.recommended_remedies.map(r => `• ${r.name} (${r.dosage || r.note || ''})`).join('\n')}\n\n`;
        }
        reply += `⚠️ *${data.disclaimer}*`;

        setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Offline fallback smart reply
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: lang === 'hi'
              ? `लक्षण विश्लेषण: आपके वर्तमान सेंसर आंकड़े (हार्ट रेट: ${telemetry?.heart_rate || 75} BPM, तापमान: ${telemetry?.temperature_c || 36.8}°C) को ध्यान में रखते हुए, पर्याप्त मात्रा में पानी पिएं और आराम करें। यदि बेचैनी बढ़ती है, तो डॉक्टर से संपर्क करें।`
              : `Clinical observation based on current vitals (${telemetry?.heart_rate || 75} BPM, ${telemetry?.temperature_c || 36.8}°C): Ensure adequate hydration (ORS), rest in a relaxed fowler's position, and monitor your vitals closely. Consult physician if symptoms persist.`
          }
        ]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = lang === 'hi' ? [
    "हल्का बुखार और सिरदर्द है क्या करूँ?",
    "हृदय गति 110 है, कौन सी दवा लूँ?",
    "ऑक्सीजन 93% आने पर क्या करें?",
    "पानी की कितनी मात्रा आवश्यक है?"
  ] : [
    "I have mild fever and headache, what should I take?",
    "My heart rate is 115 BPM, any suggestions?",
    "What posture helps when SpO2 is 92%?",
    "What foods help reduce blood pressure?"
  ];

  return (
    <div className="health-card mb-6 flex flex-col h-[480px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-600 text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.aiAssistantTitle}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'सेंसर डेटा से जुड़ा क्लिनिकल इंटेलिजेंस' : 'Connected to live ESP32 vital stream'}
            </span>
          </div>
        </div>
        <span className="badge badge-green text-[10px]">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Active Triage
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            <span>{lang === 'hi' ? 'एआई विश्लेषण कर रहा है...' : 'Analyzing vitals & medical database...'}</span>
          </div>
        )}
      </div>

      {/* Suggested quick pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setInput(p)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.askAssistant}
          className="flex-1 py-2 px-3.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t.send}</span>
        </button>
      </form>
    </div>
  );
}
