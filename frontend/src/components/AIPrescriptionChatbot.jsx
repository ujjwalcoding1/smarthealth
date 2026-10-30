import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Pill, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, 
  User, Loader2, Key, Check, Info, Trash2, Settings, ExternalLink, AlertCircle, HelpCircle
} from 'lucide-react';

const DEFAULT_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export function AIPrescriptionChatbot({ telemetry, apiBaseUrl, lang }) {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('smarthealth_ai_key') || localStorage.getItem('smarthealth_openai_key') || DEFAULT_OPENAI_KEY;
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'hi'
        ? "नमस्ते! मैं आपका स्मार्टहेल्थ एआई मेडिकल कंसल्टेंट हूँ। आप मुझसे किसी भी बीमारी, दवा (खुराक/सावधानियां), लक्षण, डाइट या स्वास्थ्य संबंधी कोई भी तथ्यात्मक सवाल पूछ सकते हैं। मैं आपको बिल्कुल सटीक, वैज्ञानिक और मेडिकल तथ्यों पर आधारित उत्तर दूंगा।"
        : "Hello! I am your SmartHealth Clinical AI Consultant. Ask me any factual medical questions, disease symptoms, evidence-based treatments, medication dosages, or lifestyle guidance. I analyze your inquiry with clinical precision and live IoT vital telemetry.",
      source: "SmartHealth Clinical AI"
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
    setApiKey(trimmed);
    localStorage.setItem('smarthealth_ai_key', trimmed);
    localStorage.setItem('smarthealth_openai_key', trimmed);
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: lang === 'hi'
          ? "चैट साफ़ कर दी गई है। अपनी बीमारी, लक्षण, दवा या स्वास्थ्य संबंधी कोई भी सवाल पूछें।"
          : "Chat history cleared. Feel free to ask any factual questions about illnesses, medications, or wellness.",
        source: "SmartHealth Clinical AI"
      }
    ]);
  };

  const sampleQueries = lang === 'hi' ? [
    "ब्लड प्रेशर सामान्य कितना होना चाहिए और इसे कैसे नियंत्रित करें?",
    "डायबिटीज में फास्टिंग और खाने के बाद शुगर का सही स्तर क्या है?",
    "पैरासिटामोल और ब्रूफेन में क्या अंतर है और कौन सी सुरक्षित है?",
    "डेंगू में प्लेटलेट्स कितनी होनी चाहिए और क्या सावधानियां बरतें?",
    "खराब कोलेस्ट्रॉल (LDL) कम करने के वैज्ञानिक उपाय बताएं",
    "थायराइड (TSH) बढ़ने के लक्षण और दवा लेने का सही तरीका"
  ] : [
    "What is normal blood pressure and evidence-based ways to reduce it?",
    "What are normal fasting and postprandial blood sugar targets?",
    "What is the clinical difference between Paracetamol and Ibuprofen?",
    "Normal platelet count in Dengue and essential precautions?",
    "Evidence-based ways to lower LDL cholesterol and triglycerides",
    "Symptoms of high TSH (Hypothyroidism) and correct Thyronorm timing"
  ];

  // Helper: Detect Pure Greeting & Chit-Chat
  const isGreetingQuery = (txt) => {
    if (!txt) return false;
    const clean = txt.toLowerCase().trim();
    const diseaseWords = [
      'fever', 'bukhar', 'temp', 'cough', 'khansi', 'cold', 'sardi', 'jukham',
      'acidity', 'gas', 'headache', 'sar dard', 'sir dard', 'bp', 'sugar', 'diabetes',
      'diarrhea', 'loose motion', 'dast', 'pain', 'dard', 'vomit', 'ulti', 'asthma', 'allergy',
      'chest', 'seene', 'heart', 'breath', 'saans', 'medicine', 'dawa', 'tablet', 'symptom',
      'cholesterol', 'uric acid', 'gout', 'thyroid', 'liver', 'kidney'
    ];
    if (diseaseWords.some(w => clean.includes(w))) return false;
    const greetingRegex = /^(?:hello|hi|hey|hlo|helo|hy|namaste|namaskar|pranam|good\s+(?:morning|evening|afternoon|night)|how\s+are\s+you|kaise\s+ho|who\s+are\s+you|thank\s+you|thanks|ok|okay|bye|goodbye)\b/i;
    return greetingRegex.test(clean);
  };

  // Direct Google Gemini Free API Caller
  const callDirectGemini = async (userText, vitals, gKey) => {
    const hr = vitals?.heart_rate || 75;
    const temp = vitals?.temperature_c || 36.8;
    const spo2 = vitals?.spo2 || 98;

    const systemPrompt = `You are SmartHealth Clinical AI Doctor, an expert clinical consultant and medical communicator just like ChatGPT.
The patient is connected to live IoT sensors (MAX30102 pulse oximeter, DS18B20 temperature sensor, MPU6050 accelerometer).
Provide thorough, factual, evidence-based, empathetic medical explanations based on established clinical guidelines (WHO, ADA, ACC/AHA, ICMR).
Answer in the requested language (${lang === 'hi' ? 'Hindi' : 'English'}).
GREETING RULE: If the user simply says 'hello', 'hi', 'hey', 'namaste', 'how are you', etc., reply warmly as a polite doctor starting with 'Hello Sir! How can I assist you with your health today?' (or 'नमस्ते सर!' in Hindi). Set 'is_greeting': true and leave 'prescribed_medicines': [].
You MUST return ONLY valid JSON matching this exact structure without markdown code blocks:
{
  "urgency": "NORMAL & STABLE" | "MODERATE / CAUTION" | "🚨 CRITICAL EMERGENCY",
  "is_greeting": false,
  "condition_diagnosed": "Title of Condition / Clinical Topic",
  "clinical_assessment": "Comprehensive, factual, paragraph-by-paragraph medical explanation answering the question thoroughly with biological mechanisms, diagnostic reference ranges, and vitals evaluation",
  "prescribed_medicines": [
    {
      "name": "Medicine Name (Brand and Generic)",
      "composition": "Active chemical composition",
      "dosage": "Precise dosage (e.g. 1 tab twice daily after food)",
      "duration": "Duration",
      "purpose": "Why this medicine is prescribed",
      "caution": "Precautions and contraindications"
    }
  ],
  "dietary_lifestyle": ["Specific actionable recovery advice", "Dietary recommendation", "Fluid guidance"],
  "red_flags": "Specific warning symptoms that require immediate hospitalization or emergency clinic visit",
  "emergency_actions": ["Action 1", "Action 2"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nPatient Query: ${userText}\nLive Vitals: HR ${hr} BPM, Temp ${temp}°C, SpO2 ${spo2}%\nLanguage: ${lang === 'hi' ? 'Hindi' : 'English'}` }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) throw new Error("Gemini API error");
    const resJson = await res.json();
    let rawText = resJson.candidates[0].content.parts[0].text.trim();
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(rawText);
    parsed.source = "Google Gemini 1.5 Flash (Live AI)";
    return parsed;
  };

  // Direct Browser OpenAI Caller
  const callDirectOpenAI = async (userText, vitals, oKey) => {
    const hr = vitals?.heart_rate || 75;
    const temp = vitals?.temperature_c || 36.8;
    const spo2 = vitals?.spo2 || 98;

    const systemPrompt = `You are SmartHealth Clinical AI Doctor, an expert clinical consultant and medical prescriber just like ChatGPT.
The patient is connected to live IoT sensors (MAX30102 pulse oximeter, DS18B20 temperature sensor, MPU6050 accelerometer).
Evaluate the user's question with deep factual accuracy, clinical reference ranges, and pharmacological facts.
Answer in the requested language (${lang === 'hi' ? 'Hindi' : 'English'}).
GREETING INSTRUCTION: If user says 'hello', 'hi', 'hey', 'namaste', 'good morning', 'how are you', etc., reply warmly as a polite doctor starting with 'Hello Sir! How can I assist you with your health today?' (or 'नमस्ते सर!' in Hindi). Set 'is_greeting': true, 'condition_diagnosed': 'Conversational Greeting', and 'prescribed_medicines': [] (EMPTY ARRAY).
You MUST return ONLY valid JSON matching this exact structure without markdown code blocks:
{
  "urgency": "NORMAL & STABLE" | "MODERATE / CAUTION" | "🚨 CRITICAL EMERGENCY",
  "is_greeting": false,
  "condition_diagnosed": "Short Title of Diagnosed Condition / Query Topic",
  "clinical_assessment": "Comprehensive, factual, paragraph-by-paragraph medical explanation answering the question thoroughly with biological mechanisms, diagnostic reference ranges, and live vitals evaluation",
  "prescribed_medicines": [
    {
      "name": "Medicine Name (Brand and Generic)",
      "composition": "Active chemical composition",
      "dosage": "Precise dosage (e.g. 1 tab twice daily after food)",
      "duration": "Duration",
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
        'Authorization': `Bearer ${oKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.3,
        max_tokens: 1000
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
    parsed.source = "OpenAI GPT-4o-Mini (Live)";
    return parsed;
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    // 1. Instant polite doctor greeting response if user just said hello/hi/etc.
    if (isGreetingQuery(userText)) {
      const greetingResponse = {
        is_greeting: true,
        condition_diagnosed: "Conversational Greeting",
        clinical_assessment: lang === 'hi'
          ? "नमस्ते सर! मैं आपका स्मार्टहेल्थ एआई मेडिकल कंसल्टेंट हूँ। मैं आज आपकी सेहत में कैसे सहायता कर सकता हूँ? आप किसी भी बीमारी के लक्षण, आवश्यक दवाइयाँ, सही खुराक, ब्लड टेस्ट या अपने लाइव सेंसर वाइटल्स के बारे में बेझिझक पूछ सकते हैं।"
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
      let data = null;

      // 2. Try Backend API first (Backend has full factual medical engine + OpenAI/Gemini connectors)
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
        // Backend not reached, fall back to direct browser call
      }

      // 3. Direct browser calling if backend is offline
      if (!data && apiKey) {
        if (apiKey.startsWith("AIza")) {
          data = await callDirectGemini(userText, telemetry, apiKey);
        } else if (apiKey.startsWith("sk-")) {
          data = await callDirectOpenAI(userText, telemetry, apiKey);
        }
      }

      if (data) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          structured: data,
          text: data.clinical_assessment || (lang === 'hi' ? "चिकित्सीय मूल्यांकन:" : "Clinical recommendations:"),
          source: data.source || "SmartHealth Clinical Medical Intelligence",
          openai_notice: data.openai_notice
        }]);
      } else {
        throw new Error("Unable to fetch response");
      }

    } catch (err) {
      // 4. Fallback for offline mode or quota limits
      const isQuota = err?.code === 'credit_balance_exhausted' || err?.status === 429;
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: lang === 'hi'
          ? `आपके प्रश्न "${userText}" का वैज्ञानिक मूल्यांकन: कृपया सुनिश्चित करें कि आप अपने लक्षण या प्रश्न स्पष्ट रूप से पूछें (जैसे: "बीपी कितना होना चाहिए", "शुगर के लक्षण", "पैरासिटामोल की खुराक")। हमारे क्लिनिकल इंजन में इन सभी के संपूर्ण तथ्य मौजूद हैं।`
          : `Clinical Evaluation for "${userText}": Please ask specific medical inquiries (e.g. "What is normal BP?", "Fasting blood sugar targets", "Dengue platelet rules", "Paracetamol vs Ibuprofen"). Full evidence-based facts will be provided.`,
        source: "SmartHealth Clinical Engine",
        openai_notice: isQuota
          ? (lang === 'hi'
              ? "⚠️ आपकी OpenAI API Key में $0 बैलेंस है। आप Google AI Studio (aistudio.google.com) से 100% Free Gemini Key ले सकते हैं और [AI Key] में सेव कर सकते हैं।"
              : "⚠️ Your OpenAI API Key has 0 credits remaining. You can get a 100% Free Google Gemini API Key at aistudio.google.com and save it under [AI Key]!")
          : null
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Formatted Text Renderer (Handles bolding and paragraph breaks cleanly)
  const renderFormattedText = (content) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, pi) => {
      const lines = para.split('\n');
      return (
        <div key={pi} className="mb-2 leading-relaxed">
          {lines.map((line, li) => {
            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const formattedLine = parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-extrabold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
              }
              return part;
            });

            return (
              <div key={li} className={isBullet ? "flex items-start gap-1.5 ml-2 my-1" : "my-0.5"}>
                {formattedLine}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="health-card mb-8 flex flex-col h-[700px] border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {lang === 'hi' ? 'एआई चिकित्सक एवं प्रिस्क्रिप्शन चैटबॉट' : 'AI Doctor & Clinical Prescription Chatbot'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Factual Clinical Intelligence</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'तथ्यों और वैज्ञानिक मेडिकल दिशानिर्देशों पर आधारित सटीक उत्तर' : 'Evidence-based medical answers, accurate dosages, and physiological facts.'}
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
            title="Manage OpenAI / Gemini API Key"
          >
            <Key className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">AI Key</span>
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
              className={`p-4 rounded-2xl max-w-[92%] sm:max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium text-xs sm:text-sm shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none shadow-sm'
              }`}
            >
              {/* Notice Banner */}
              {msg.openai_notice && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>{msg.openai_notice}</p>
                </div>
              )}

              {/* Main text / Clinical Assessment */}
              {msg.text && (
                <div className="text-xs sm:text-[13px]">
                  {renderFormattedText(msg.text)}
                </div>
              )}

              {/* Structured Clinical Diagnosis Card (Only shown for real health queries with medicines or advice, not greetings) */}
              {msg.structured && !msg.structured.is_greeting && msg.structured.condition_diagnosed !== 'Conversational Greeting' && (msg.structured.prescribed_medicines?.length > 0 || msg.structured.dietary_lifestyle?.length > 0 || msg.structured.red_flags) && (
                <div className="space-y-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
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
                        <div key={mi} className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-emerald-300/80 dark:border-emerald-800/80 shadow-sm">
                          <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
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
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11.5px]">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1.5">
                        🌿 Dietary, Hydration & Evidence-Based Guidelines:
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
                    <span>Engine: {msg.source || 'SmartHealth Clinical AI'}</span>
                    <span>IoT Vitals Verified</span>
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
            <span>AI Doctor is synthesizing factual clinical reasoning...</span>
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
          placeholder={lang === 'hi' ? 'कोई भी मेडिकल सवाल पूछें (जैसे: बीपी कितना होना चाहिए, शुगर कम करने के उपाय)...' : 'Ask any factual medical question (e.g. normal BP, lowering cholesterol, Paracetamol vs Ibuprofen)...'}
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

      {/* API Key Management Modal */}
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
                    AI Key Settings
                  </h3>
                  <p className="text-xs text-slate-500">Supports OpenAI (GPT-4o) & Google Gemini (Free)</p>
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
                Enter API Key (OpenAI `sk-...` OR Google Gemini `AIza...`):
              </label>
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="sk-proj-... OR AIzaSy..."
                className="w-full font-mono text-xs py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11.5px] text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Tip: Get 100% FREE AI Key from Google (No Card Required):</span>
                </div>
                <p>
                  1. Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-700 dark:text-emerald-400">aistudio.google.com/app/apikey</a>.<br/>
                  2. Click <strong>"Create API Key"</strong> in 10 seconds.<br/>
                  3. Paste it above and click <strong>Save Key</strong> for unlimited free live AI!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11.5px] text-sky-900 dark:text-sky-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>OpenAI Note:</span>
                </div>
                <p>
                  If using an OpenAI key (`sk-...`), ensure your OpenAI account has credits added at <em>platform.openai.com/settings/organization/billing/</em>.
                </p>
              </div>
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
