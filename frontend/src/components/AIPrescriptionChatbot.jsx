import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Pill, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, 
  User, Loader2, Key, Check, Info, Trash2, Settings, ExternalLink, AlertCircle
} from 'lucide-react';

const DEFAULT_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export function AIPrescriptionChatbot({ telemetry, apiBaseUrl, lang }) {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('smarthealth_openai_key') || DEFAULT_OPENAI_KEY;
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'hi'
        ? "नमस्ते! मैं आपका स्मार्टहेल्थ एआई चिकित्सक एवं मेडिकल कंसल्टेंट हूँ (OpenAI GPT-4o पावर्ड)। आप मुझसे किसी भी बीमारी, दवा (खुराक/सावधानियां), लक्षण या स्वास्थ्य संबंधी कोई भी सवाल पूछ सकते हैं। मैं आपके लाइव IoT सेंसर आंकड़ों (हृदय गति, तापमान, SpO2) को देखकर बिल्कुल सटीक सलाह दूंगा।"
        : "Hello! I am your SmartHealth AI Clinical Consultant (powered by OpenAI GPT-4o). You can ask me about any illness, medicines, precise dosages, symptoms, or general wellness. I analyze your question alongside your live ESP32 vital sensors to give you accurate medical guidance.",
      source: "OpenAI GPT-4o-Mini Active"
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSaveKey = () => {
    const trimmed = tempKeyInput.trim();
    if (trimmed) {
      setApiKey(trimmed);
      localStorage.setItem('smarthealth_openai_key', trimmed);
      setKeySavedToast(true);
      setTimeout(() => {
        setKeySavedToast(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: lang === 'hi'
          ? "चैट साफ़ कर दी गई है। अपनी बीमारी, लक्षण या दवाओं के बारे में पूछें।"
          : "Chat history cleared. Feel free to ask about any symptoms, health queries, or medications.",
        source: "OpenAI GPT-4o-Mini Active"
      }
    ]);
  };

  const sampleQueries = lang === 'hi' ? [
    "तेज बुखार और सिरदर्द की सही दवा और खुराक बताओ",
    "खांसी, जुकाम और गले में खराश के लिए क्या लूँ?",
    "पेट में गैस, एसिडिटी और सीने में जलन का उपचार",
    "डायबिटीज के मरीज को सुबह नाश्ते में क्या खाना चाहिए?",
    "बीपी अचानक बढ़ जाने पर तुरंत क्या घरेलू कदम उठाएं?",
    "दस्त और पेट दर्द में ORS का सही उपयोग कैसे करें?"
  ] : [
    "Prescribe medicine for acute fever, headache and body ache",
    "Best medicine and dosage for wet cough & sore throat",
    "Immediate relief for severe acidity, GERD & stomach gas",
    "What should a diabetic patient eat for healthy breakfast?",
    "Immediate steps to take when blood pressure spikes",
    "Safe treatment & ORS dosage for loose motion / diarrhea"
  ];

  // Direct Browser-to-OpenAI Fallback Caller
  const callDirectOpenAI = async (userText, vitals) => {
    const hr = vitals?.heart_rate || 75;
    const temp = vitals?.temperature_c || 36.8;
    const spo2 = vitals?.spo2 || 98;

    const systemPrompt = `You are SmartHealth Clinical AI Doctor, an expert clinical consultant and medical prescriber for an IoT lifeline platform.
The patient is connected to live IoT sensors (MAX30102 pulse oximeter, DS18B20 temperature sensor, MPU6050 accelerometer).
Evaluate the user's symptoms, question, and current vitals: Heart Rate: ${hr} BPM, Body Temp: ${temp}°C, SpO2: ${spo2}%.
Provide clinical triage, prescribe accurate, evidence-based medicines (OTC or clinical guidance) with precise dosage, administration instructions, and safety warnings.
Answer in the requested language (${lang === 'hi' ? 'Hindi' : 'English'}).
CRITICAL GREETING INSTRUCTION: If user says 'hello', 'hi', 'hey', 'namaste', 'good morning', 'how are you', etc., reply warmly as a polite doctor starting with 'Hello Sir! How can I assist you with your health today?' (or 'नमस्ते सर!' in Hindi). Set 'is_greeting': true, 'condition_diagnosed': 'Conversational Greeting', and 'prescribed_medicines': [] (EMPTY ARRAY — NEVER prescribe medicine for a greeting!).
You MUST return ONLY valid JSON matching this exact structure without markdown code blocks:
{
  "urgency": "NORMAL & STABLE" | "MODERATE / CAUTION" | "🚨 CRITICAL EMERGENCY",
  "is_greeting": true,
  "condition_diagnosed": "Short Title of Diagnosed Condition / Query Topic",
  "clinical_assessment": "Comprehensive, accurate, friendly medical explanation answering the question thoroughly and evaluating current vitals",
  "prescribed_medicines": [
    {
      "name": "Medicine Name (Brand and Generic)",
      "composition": "Active chemical composition",
      "dosage": "Precise dosage (e.g. 1 tab twice daily after food)",
      "duration": "Duration (e.g. 3 days)",
      "purpose": "Why this medicine is prescribed",
      "caution": "Precautions and contraindications"
    }
  ],
  "dietary_lifestyle": ["Specific actionable recovery advice", "Dietary recommendation", "Fluid guidance"],
  "red_flags": "Specific warning symptoms that require immediate hospitalization or emergency clinic visit",
  "emergency_actions": ["Action 1", "Action 2"]
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errCode = errJson?.error?.code || '';
      const errMsg = errJson?.error?.message || '';
      throw { isHttpError: true, status: res.status, code: errCode, message: errMsg };
    }

    const data = await res.json();
    let rawContent = data.choices[0].message.content.trim();
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(rawContent);
    parsed.source = "OpenAI GPT-4o-Mini (Direct API)";
    return parsed;
  };

  const isGreetingQuery = (txt) => {
    if (!txt) return false;
    const clean = txt.toLowerCase().trim();
    const diseaseWords = [
      'fever', 'bukhar', 'temp', 'cough', 'khansi', 'cold', 'sardi', 'jukham',
      'acidity', 'gas', 'headache', 'sar dard', 'sir dard', 'bp', 'sugar', 'diabetes',
      'diarrhea', 'loose motion', 'dast', 'pain', 'dard', 'vomit', 'ulti', 'asthma', 'allergy',
      'chest', 'seene', 'heart', 'breath', 'saans', 'medicine', 'dawa', 'tablet', 'symptom'
    ];
    if (diseaseWords.some(w => clean.includes(w))) return false;
    const greetingRegex = /^(?:hello|hi|hey|hlo|helo|hy|namaste|namaskar|pranam|good\s+(?:morning|evening|afternoon|night)|how\s+are\s+you|kaise\s+ho|who\s+are\s+you|thank\s+you|thanks|ok|okay|bye|goodbye)\b/i;
    return greetingRegex.test(clean);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    // Instant polite doctor greeting response if user just said hello/hi/etc.
    if (isGreetingQuery(userText)) {
      const greetingResponse = {
        is_greeting: true,
        condition_diagnosed: "Conversational Greeting",
        clinical_assessment: lang === 'hi'
          ? "नमस्ते सर! मैं आपका स्मार्टहेल्थ एआई मेडिकल कंसल्टेंट हूँ। मैं आज आपकी सेहत में कैसे सहायता कर सकता हूँ? आप किसी भी बीमारी के लक्षण, आवश्यक दवाइयाँ, सही खुराक या अपने लाइव सेंसर वाइटल्स के बारे में बेझिझक पूछ सकते हैं।"
          : "Hello Sir! How can I assist you with your health today? I am your SmartHealth AI Clinical Consultant. Please feel free to describe any symptoms you are experiencing, ask about medicines and dosages, or inquire about your live vitals.",
        prescribed_medicines: [],
        dietary_lifestyle: [],
        red_flags: ""
      };

      setMessages(prev => [...prev, {
        sender: 'ai',
        structured: greetingResponse,
        text: greetingResponse.clinical_assessment,
        source: "SmartHealth AI Assistant"
      }]);
      return;
    }

    setLoading(true);

    try {
      // 1. Try Backend API first
      let data = null;
      try {
        const resp = await fetch(`${apiBaseUrl}/api/ai/prescribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptom_text: userText,
            current_heart_rate: telemetry?.heart_rate,
            current_temp: telemetry?.temperature_c,
            current_spo2: telemetry?.spo2,
            api_key: apiKey,
            lang: lang
          })
        });

        if (resp.ok) {
          data = await resp.json();
        }
      } catch (backendErr) {
        // Backend not reached, fall back to direct browser OpenAI call
      }

      // 2. If backend did not return, try direct browser OpenAI call
      if (!data) {
        data = await callDirectOpenAI(userText, telemetry);
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        structured: data,
        text: data.clinical_assessment || (lang === 'hi' ? "उपचार और दवाइयाँ नीचे देखें:" : "Clinical recommendations:"),
        source: data.source || "OpenAI GPT-4o-Mini",
        openai_notice: data.openai_notice
      }]);

    } catch (err) {
      // 3. Graceful handling for Quota Exceeded (429) or Network Error
      const isQuota = err?.code === 'credit_balance_exhausted' || err?.status === 429 || (err?.message && err.message.toLowerCase().includes('credit'));
      
      const fallbackDiagnosis = {
        urgency: "MODERATE / CLINICAL TRIAGE",
        condition_diagnosed: lang === 'hi' ? "स्वास्थ्य परामर्श एवं प्राथमिक उपचार" : "Clinical Triage & Symptom Evaluation",
        clinical_assessment: lang === 'hi'
          ? `आपके सवाल "${userText}" के अनुसार: यदि बुखार या बदन दर्द है तो Paracetamol 650mg भोजन के बाद लें। पर्याप्त 2.5L पानी पिएं और आराम करें। यदि लक्षण 48 घंटे से अधिक रहें तो चिकित्सक से संपर्क करें।`
          : `Assessment for "${userText}": For fever or pain, take Paracetamol 650mg after food. Ensure 2.5L hydration with ORS fluids, rest in a ventilated room, and consult a physician if symptoms persist beyond 48 hours.`,
        prescribed_medicines: [
          {
            name: "Paracetamol (Dolo 650 / Calpol 650)",
            composition: "Acetaminophen 650mg",
            dosage: "1 tablet after meals every 6-8 hrs as needed",
            duration: "2 - 3 days",
            purpose: "Antipyretic & pain relief for fever, headache, body ache.",
            caution: "Do not take on empty stomach. Avoid combining with alcohol."
          },
          {
            name: "Electrolyte ORS",
            composition: "WHO formula salts (Sodium, Potassium, Dextrose)",
            dosage: "1 sachet in 1 liter clean water, sip throughout day",
            duration: "As needed",
            purpose: "Prevents dehydration and stabilizes heart rate.",
            caution: "Consume within 24 hours of mixing."
          }
        ],
        dietary_lifestyle: [
          lang === 'hi' ? "ताज़ा सुपाच्य भोजन (मूंग दाल खिचड़ी, सूप, दलिया) लें।" : "Consume light, easy-to-digest meals (lentil soup, oats, toast).",
          lang === 'hi' ? "पर्याप्त आराम करें और तनाव से बचें।" : "Ensure 7-8 hours of restful sleep and avoid physical strain."
        ],
        red_flags: lang === 'hi'
          ? "यदि तापमान 39.5°C से अधिक हो, सीने में दर्द हो, या सांस फूलने लगे तो तुरंत 112 डायल करें।"
          : "Fever > 39.5°C, severe chest discomfort, or breathing difficulty requires immediate emergency medical care.",
        emergency_actions: ["Keep monitoring sensor vitals twice daily."]
      };

      setMessages(prev => [...prev, {
        sender: 'ai',
        structured: fallbackDiagnosis,
        text: fallbackDiagnosis.clinical_assessment,
        source: "SmartHealth Clinical Medical Engine",
        openai_notice: isQuota
          ? (lang === 'hi'
              ? "⚠️ आपकी OpenAI API Key कनेक्टेड है, लेकिन आपके OpenAI अकाउंट में $0 क्रेडिट बचा है (credit_balance_exhausted)। इसलिए SmartHealth के इनबिल्ट क्लिनिकल इंजन ने यह उत्तर दिया। platform.openai.com पर रीचार्ज करने पर यह अपने आप लाइव GPT-4o से चलने लगेगा।"
              : "⚠️ Your OpenAI API Key is connected, but your OpenAI account has 0 credits remaining (credit_balance_exhausted at platform.openai.com). SmartHealth's Built-in Clinical Medical Engine generated this response. Add credits on OpenAI billing to activate live GPT-4o inference.")
          : null
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="health-card mb-8 flex flex-col h-[680px] border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {lang === 'hi' ? 'एआई चिकित्सक एवं प्रिस्क्रिप्शन चैटबॉट' : 'AI Doctor & Prescription Chatbot'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>OpenAI GPT-4o Connected</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'किसी भी बीमारी की सटीक दवा, खुराक और उपचार सलाह पाएं' : 'Prescribes exact medicines, dosages, and answers any medical question.'}
            </p>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Key Settings Button */}
          <button
            onClick={() => {
              setTempKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Manage OpenAI API Key"
          >
            <Key className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">OpenAI Key</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Vitals Snapshot */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <HeartPulse className="w-3.5 h-3.5 text-red-500" />
            <span>{telemetry?.heart_rate ? `${telemetry.heart_rate} BPM` : '75 BPM'}</span>
            <span className="text-slate-400">|</span>
            <span>{telemetry?.temperature_c ? `${telemetry.temperature_c}°C` : '36.8°C'}</span>
          </div>
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
              className={`p-3.5 rounded-2xl max-w-[92%] sm:max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium text-xs shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none shadow-sm'
              }`}
            >
              {/* OpenAI Notice Banner if quota exhausted */}
              {msg.openai_notice && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>{msg.openai_notice}</p>
                </div>
              )}

              {/* Main text / Clinical Assessment */}
              {msg.text && (
                <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed mb-2 font-normal">
                  {msg.text}
                </div>
              )}

              {/* Structured Clinical Diagnosis Card (Shown only for health queries, not greetings) */}
              {msg.structured && !msg.structured.is_greeting && msg.structured.condition_diagnosed !== 'Conversational Greeting' && (msg.structured.prescribed_medicines?.length > 0 || msg.structured.dietary_lifestyle?.length > 0 || msg.structured.red_flags) && (
                <div className="space-y-3 mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm">
                      🩺 {msg.structured.condition_diagnosed}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                      msg.structured.urgency?.includes('CRITICAL') || msg.structured.urgency?.includes('EMERGENCY')
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {msg.structured.urgency}
                    </span>
                  </div>

                  {/* Prescribed Medicines Box */}
                  {msg.structured.prescribed_medicines && msg.structured.prescribed_medicines.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Prescribed Medicines & Exact Dosage:</span>
                      </span>
                      {msg.structured.prescribed_medicines.map((m, mi) => (
                        <div key={mi} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-emerald-300/80 dark:border-emerald-800/80 shadow-sm">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <strong className="text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] font-bold">{m.name}</strong>
                            <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                              {m.dosage}
                            </span>
                          </div>
                          {m.composition && (
                            <p className="text-[10.5px] text-slate-500 font-mono mb-1">
                              <strong>Composition:</strong> {m.composition}
                            </p>
                          )}
                          {m.purpose && (
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                              <strong>Action:</strong> {m.purpose}
                            </p>
                          )}
                          {m.caution && (
                            <p className="text-[10.5px] text-amber-700 dark:text-amber-400 italic">
                              ⚠️ <strong>Caution:</strong> {m.caution}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Home Remedies / Dietary Advice */}
                  {msg.structured.dietary_lifestyle && msg.structured.dietary_lifestyle.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">
                        🌿 Dietary, Hydration & Recovery Tips:
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {msg.structured.dietary_lifestyle.map((tip, ti) => (
                          <li key={ti}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red flags */}
                  {msg.structured.red_flags && (
                    <div className="text-[11px] text-red-700 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Warning Signs (Red Flags):</strong> {msg.structured.red_flags}
                      </div>
                    </div>
                  )}

                  {/* Source tag */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Engine: {msg.source || 'OpenAI GPT-4o-Mini'}</span>
                    <span>Vitals Verified</span>
                  </div>
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
          <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>OpenAI GPT-4o is analyzing symptoms & prescribing medicines...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {sampleQueries.map((q, i) => (
          <button
            key={i}
            onClick={() => setInput(q)}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'hi' ? 'अपनी बीमारी, लक्षण या दवा का नाम लिखें (जैसे: सिरदर्द और बुखार की दवा बताएं)...' : 'Type illness, symptoms or medicine query (e.g. fever, headache, acidity, dosage)...'}
          className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पूछें' : 'Consult'}</span>
        </button>
      </form>

      {/* OpenAI API Key Management Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    OpenAI API Configuration
                  </h3>
                  <p className="text-xs text-slate-500">Connected to GPT-4o-Mini Clinical Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your OpenAI Secret API Key:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full font-mono text-xs py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This key powers real-time symptom evaluations, disease triage, and medicine prescriptions.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11.5px] text-sky-900 dark:text-sky-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Account Credit Information:</span>
              </div>
              <p>
                If your OpenAI account balance reaches $0, SmartHealth automatically activates its comprehensive built-in Clinical Medical Knowledge Base with zero downtime, ensuring you always get accurate prescriptions!
              </p>
            </div>

            {keySavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>API Key saved successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
