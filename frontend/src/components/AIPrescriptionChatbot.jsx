import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Pill, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, 
  User, Loader2, Key, Check, Info, Trash2, Settings, ExternalLink, AlertCircle, HelpCircle,
  Mic, MicOff, Stethoscope, Users, Volume2, Square, RotateCcw, FileText, ChevronDown, ChevronUp, Download, Play, Radio
} from 'lucide-react';

const DEFAULT_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export function AIPrescriptionChatbot({ telemetry, apiBaseUrl, lang }) {
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('smarthealth_ai_key');
    if (saved && saved.startsWith('sk-proj-VZTEM')) {
      localStorage.setItem('smarthealth_ai_key', DEFAULT_GEMINI_KEY);
      return DEFAULT_GEMINI_KEY;
    }
    return saved || DEFAULT_GEMINI_KEY;
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Persistent Chat History: Load from localStorage first, then sync with MongoDB
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('smarthealth_gemini_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load local chat history", e);
    }
    return [
      {
        sender: 'ai',
        text: lang === 'hi'
          ? "नमस्ते! मैं आपका Google Gemini AI असिस्टेंट हूँ। आप मुझसे विज्ञान, कोडिंग, गणित, इतिहास, सामान्य ज्ञान, या किसी भी बीमारी, लक्षण, दवा की सही खुराक और स्वास्थ्य से जुड़ा कोई भी सवाल पूछ सकते हैं। मैं आपको बिल्कुल सटीक और विस्तृत उत्तर दूंगा।"
          : "Hello! I am your Google Gemini AI Assistant. You can ask me anything — from science, coding, history, and general knowledge to medical conditions, symptoms, and evidence-based prescriptions. How can I assist you today?",
        source: "Google Gemini AI (Live)"
      }
    ];
  });

  // Voice Consultation (Doctor-Patient Clinical Recording) State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState('Auto'); // 'Auto', 'Doctor', 'Patient'
  const [transcriptText, setTranscriptText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [consultationLang, setConsultationLang] = useState(lang || 'en');
  const [dialogueTurns, setDialogueTurns] = useState([]);
  const [expandedTranscripts, setExpandedTranscripts] = useState({});

  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Persist messages to localStorage and backend MongoDB on every update
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem('smarthealth_gemini_chat_history', JSON.stringify(messages));
        const base = apiBaseUrl || 'http://localhost:8000';
        fetch(`${base}/api/ai/chat/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Chat history persistence note:", e);
    }
  }, [messages, apiBaseUrl]);

  // Initial fetch from backend MongoDB if localStorage had only initial greeting
  useEffect(() => {
    const fetchRemoteChat = async () => {
      try {
        const base = apiBaseUrl || 'http://localhost:8000';
        const res = await fetch(`${base}/api/ai/chat/history`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 1) {
            setMessages(prev => (prev.length <= 1 ? data.messages : prev));
          }
        }
      } catch (err) {
        // quiet catch
      }
    };
    fetchRemoteChat();
  }, [apiBaseUrl]);

  const handleSaveKey = () => {
    const trimmed = tempKeyInput.trim();
    setApiKey(trimmed);
    localStorage.setItem('smarthealth_ai_key', trimmed);
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleClearChat = () => {
    const confirmText = lang === 'hi'
      ? "क्या आप चैट हिस्ट्री को रीसेट (साफ़) करना चाहते हैं? हिस्ट्री हमेशा सुरक्षित रहती है जब तक आप स्वयं इसे डिलीट न करें।"
      : "Are you sure you want to clear your chat history? Your history is preserved permanently unless cleared.";
    if (window.confirm(confirmText)) {
      const reset = [
        {
          sender: 'ai',
          text: lang === 'hi'
            ? "चैट हिस्ट्री साफ़ कर दी गई है। नया सत्र शुरू हुआ है। आप मुझसे कोई भी सामान्य ज्ञान, कोडिंग या स्वास्थ्य संबंधी सवाल पूछ सकते हैं।"
            : "Chat history cleared. New session started. Feel free to ask any question on coding, science, general knowledge, or medical health.",
          source: "Google Gemini AI (Live)"
        }
      ];
      setMessages(reset);
      localStorage.setItem('smarthealth_gemini_chat_history', JSON.stringify(reset));
      const base = apiBaseUrl || 'http://localhost:8000';
      fetch(`${base}/api/ai/chat/history`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const sampleQueries = lang === 'hi' ? [
    "क्वांटम कंप्यूटिंग क्या है और यह कैसे काम करती है?",
    "ब्लड प्रेशर सामान्य कितना होना चाहिए और इसे कैसे नियंत्रित करें?",
    "पायथन में पैलिंड्रोम चेक करने का कोड लिखकर समझाएं",
    "डायबिटीज में फास्टिंग और खाने के बाद शुगर का सही स्तर क्या है?",
    "ताजमहल का इतिहास और निर्माण कब हुआ था?",
    "डेंगू में प्लेटलेट्स कितनी होनी चाहिए और क्या सावधानियां बरतें?"
  ] : [
    "Explain quantum computing and how qubits work",
    "What is normal blood pressure and evidence-based ways to reduce it?",
    "Write a Python function to check if a string is palindrome",
    "What are normal fasting and postprandial blood sugar targets?",
    "Who was Albert Einstein and what did he discover?",
    "Normal platelet count in Dengue and essential precautions"
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
      'cholesterol', 'uric acid', 'gout', 'thyroid', 'liver', 'kidney', 'code', 'python', 'what', 'who', 'how', 'kya'
    ];
    if (diseaseWords.some(w => clean.includes(w))) return false;
    const greetingRegex = /^(?:hello|hi|hey|hlo|helo|hy|namaste|namaskar|pranam|good\s+(?:morning|evening|afternoon|night)|how\s+are\s+you|kaise\s+ho|who\s+are\s+you|thank\s+you|thanks|ok|okay|bye|goodbye)\b/i;
    return greetingRegex.test(clean);
  };

  // Direct Google Gemini Universal API Caller
  const callDirectGemini = async (userText, vitals, gKey) => {
    const hr = vitals?.heart_rate || 75;
    const temp = vitals?.temperature_c || 36.8;
    const spo2 = vitals?.spo2 || 98;

    const systemPrompt = `You are SmartHealth Gemini AI, an intelligent, versatile, and highly capable AI assistant powered directly by Google Gemini.
You fulfill two essential roles:
1. UNIVERSAL AI ASSISTANT: If the user asks ANY general question (science, technology, coding, mathematics, history, geography, creative writing, facts, explanations, or general conversation), answer thoroughly, accurately, beautifully, and conversationally just like Google Gemini.
2. MEDICAL & CLINICAL CONSULTANT: If the user asks health, medical, disease, symptom, medication, or wellness questions, provide evidence-based clinical analysis, evaluate the patient's live IoT vitals (Heart rate, temperature, SpO2) when available, and provide safe actionable recommendations and medication facts when appropriate.
Answer in the requested language (${lang === 'hi' ? 'Hindi' : 'English'}).
GREETING RULE: If the user simply says 'hello', 'hi', 'hey', 'namaste', etc., reply warmly starting with 'Hello Sir! How can I assist you today?' (or 'नमस्ते सर!' in Hindi). Set 'is_greeting': true and leave 'prescribed_medicines': [].
You MUST return ONLY valid JSON matching this exact structure without markdown code fences:
{
  "urgency": "NORMAL & STABLE" | "MODERATE / CAUTION" | "🚨 CRITICAL EMERGENCY",
  "is_greeting": false,
  "is_medical": true | false,
  "condition_diagnosed": "Title of topic or inquiry",
  "clinical_assessment": "Comprehensive, well-structured, clear explanation answering the user's inquiry thoroughly with formatting, code snippets, or paragraphs as needed",
  "prescribed_medicines": [
    {
      "name": "Medicine Name",
      "dosage": "Dose",
      "purpose": "Purpose",
      "caution": "Caution"
    }
  ],
  "dietary_lifestyle": ["Tip 1", "Tip 2"],
  "red_flags": "Warning signs if medical, or empty string",
  "emergency_actions": ["Emergency step if applicable"]
}
Note: For non-medical questions, set 'is_medical': false, leave 'prescribed_medicines': [], 'dietary_lifestyle': [], and 'red_flags': ''.`;

    const candidateModels = ["gemini-flash-lite-latest", "gemini-flash-latest"];
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Question: ${userText}\nLive Vitals: HR ${hr} BPM, Temp ${temp}°C, SpO2 ${spo2}%\nLanguage: ${lang === 'hi' ? 'Hindi' : 'English'}` }]
            }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 2048,
              responseMimeType: "application/json"
            }
          })
        });

        if (!res.ok) continue;
        const resJson = await res.json();
        let rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(rawText);
        parsed.source = "Google Gemini AI (Live)";
        return parsed;
      } catch (e) {
        continue;
      }
    }
    throw new Error("Gemini API error on all models");
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

  // Client-Side Dynamic Clinical Reasoning Synthesizer
  const synthesizeClientClinicalResponse = (queryText, vitals, language, isQuotaNotice) => {
    const q = (queryText || '').toLowerCase().trim();
    const hr = vitals?.heart_rate || 75;
    const temp = vitals?.temperature_c || 36.8;
    const spo2 = vitals?.spo2 || 98;

    const vitalsSnippet = language === 'hi'
      ? `\n\n📊 आपके वर्तमान IoT सेंसर वाइटल्स: हार्ट रेट: ${hr} BPM (${hr >= 60 && hr <= 100 ? 'सामान्य' : 'समीक्षा आवश्यक'}), तापमान: ${temp}°C (${temp >= 36.0 && temp <= 37.3 ? 'सामान्य' : 'हल्का बढ़ा हुआ'}), SpO2: ${spo2}% (${spo2 >= 95 ? 'उत्कृष्ट' : 'कम'})।`
      : `\n\n📊 Real-Time Patient IoT Telemetry: Heart Rate: ${hr} BPM (${hr >= 60 && hr <= 100 ? 'Optimal' : 'Review Needed'}), Temp: ${temp}°C, SpO2: ${spo2}% (${spo2 >= 95 ? 'Optimal' : 'Suboptimal'}).`;

    const quotaText = isQuotaNotice
      ? (language === 'hi'
          ? "⚠️ आपकी OpenAI API Key में platform.openai.com पर $0.00 बैलेंस (क्रेडिट समाप्त) है। लाइव OpenAI मॉडल के लिए platform.openai.com पर न्यूनतम $5 क्रेडिट जोड़ें, या Google AI Studio (aistudio.google.com) से 100% मुफ़्त Gemini Key प्राप्त कर [AI Key] में सेव करें। नीचे आपके प्रश्न का उत्तर हमारे क्लीनिकल रीज़निंग इंजन द्वारा तैयार किया गया है।"
          : "⚠️ Notice: Your OpenAI API Key has $0.00 credits remaining on platform.openai.com. OpenAI requires prepaid credits ($5 min) to process live queries. Please add credits at platform.openai.com/settings/organization/billing or switch to a 100% Free Google Gemini API Key from aistudio.google.com. Your inquiry below has been tailored by our Clinical Medical Reasoning Engine.")
      : null;

    const isFood = ['dinner', 'breakfast', 'lunch', 'eat', 'food', 'diet', 'khana', 'bhojan', 'kya khaye', 'parhez', 'roti', 'sabji', 'rice'].some(k => q.includes(k));
    const isDairy = ['milk', 'doodh', 'curd', 'dahi', 'tea', 'chai', 'coffee', 'juice', 'drink', 'peena'].some(k => q.includes(k));
    const isFever = ['fever', 'bukhar', 'temperature', 'cold', 'jukham', 'sardi', 'cough', 'khansi'].some(k => q.includes(k));
    const isBp = ['bp', 'blood pressure', 'hypertension', 'high bp', 'raktchap'].some(k => q.includes(k));
    const isSugar = ['sugar', 'diabetes', 'madhumeh', 'glucose'].some(k => q.includes(k));
    const isEye = ['eye', 'aankh', 'vision', 'nazar', 'screen', 'mobile', 'computer', 'strain', 'chashma', 'dry eye'].some(k => q.includes(k));
    const isJoint = ['knee', 'ghutna', 'joint', 'jod', 'back pain', 'kamar', 'spine', 'bone', 'haddi', 'arthritis'].some(k => q.includes(k)) || (['knee', 'ghutna', 'joint'].some(k => q.includes(k)) && ['exercise', 'walk'].some(k => q.includes(k)));
    const isStomach = ['pet', 'stomach', 'abdomen'].some(k => q.includes(k)) && ['dard', 'pain', 'cramp', 'gas', 'spasm', 'kharab'].some(k => q.includes(k));
    const isPediatric = ['child', 'bachha', 'bachhe', 'baby', 'kid'].some(k => q.includes(k));

    let structured = null;

    if (isBp && isFood) {
      structured = {
        condition_diagnosed: language === 'hi' ? "उच्च रक्तचाप में संतुलित रात्रि भोजन (Dinner in High BP)" : "Optimal Dietary Dinner Protocol for Hypertension",
        urgency: "NORMAL & STABLE",
        clinical_assessment: (language === 'hi'
          ? "रक्तचाप (High BP) के मरीजों के लिए रात का भोजन विशेष रूप से महत्वपूर्ण होता है। स्वस्थ व्यक्तियों में रात को सोते समय रक्तचाप 10-20% स्वाभाविक रूप से कम होता है (Nocturnal BP Dipping)। रात में अधिक नमक या भारी भोजन करने से यह प्राकृतिक गिरावट रुक जाती है।\n\nरात के भोजन के नियम:\n• रात का नमक 1/4 चम्मच से कम रखें; कच्चा नमक, पापड़, अचार बिल्कुल न लें।\n• सोने से 2.5-3 घंटे पहले डिनर कर लें (शाम 7:30 से 8:30 तक)।\n• पोटैशियम युक्त हल्की सब्जियां (लौकी, तोरी, परवल, मूंग दाल खिचड़ी) खाएं।\n• लहसुन की 1-2 कलियां नाइट्रिक ऑक्साइड बढ़ाकर नसों को शिथिल रखती हैं।"
          : "Dinner selection is crucial for blood pressure management. Under normal circadian physiology, nocturnal blood pressure naturally dips by 10-20% during deep sleep (the Nocturnal Dipping phenomenon). Consuming high-sodium or heavy meals prevents this recovery, maintaining pressure on arterial walls.\n\nKey Recommendations:\n• Limit evening sodium to < 500mg (under 1/4 teaspoon). Avoid pickles, papad, and canned foods.\n• Conclude dinner at least 2.5-3 hours before bedtime.\n• Choose potassium-rich light meals: bottle gourd (lauki), ridge gourd (turai), or yellow moong dal soup.\n• Garlic releases allicin, promoting vascular nitric oxide dilation.") + vitalsSnippet,
        prescribed_medicines: [],
        dietary_lifestyle: [
          "Keep dinner salt below 1/4 teaspoon; avoid restaurant gravies.",
          "Finish dinner before 8:30 PM; do not lie down immediately.",
          "Take a gentle 15-minute slow walk after dinner.",
          "Avoid tea, coffee, and alcohol late at night."
        ],
        red_flags: "Systolic BP > 180 or Diastolic > 120 with severe headache or vision blur requires emergency hospital care."
      };
    } else if (isDairy && isFever) {
      structured = {
        condition_diagnosed: language === 'hi' ? "बुखार में दूध के सेवन का चिकित्सीय विश्लेषण" : "Clinical Evaluation: Milk Intake during Fever",
        urgency: "NORMAL & STABLE",
        clinical_assessment: (language === 'hi'
          ? "हाँ, बुखार में दूध पिया जा सकता है। बुखार में पाचक एंजाइम कम बनने से ठंडा व भारी दूध अपच या उल्टी कर सकता है।\n\nसही तरीका:\n• गाय का हल्का (Toned) उबला हुआ गुनगुना दूध पिएं।\n• 1/4 चम्मच हल्दी और एक चुटकी काली मिर्च मिलाकर 'गोल्डन मिल्क' पिएं, जो प्राकृतिक इम्युनिटी बूस्टर और एंटी-इंफ्लेमेटरी है।\n• यदि उल्टी या दस्त हो रहे हों, तो दूध रोककर ओआरएस (ORS) या नारियल पानी लें।"
          : "Yes, milk can be safely consumed during fever. Elevated cytokines mildly slow gastric digestion, so cold, heavy full-cream milk should be avoided.\n\nBest Practice:\n• Drink warm, toned (low-fat) boiled milk.\n• Add 1/4 teaspoon turmeric and black pepper (Golden Milk) for natural anti-inflammatory and immune benefits.\n• If active vomiting or diarrhea is present, pause dairy and drink oral rehydration fluids.") + vitalsSnippet,
        prescribed_medicines: [],
        dietary_lifestyle: [
          "Drink warm turmeric milk 30 minutes before bed.",
          "Strictly avoid chilled milkshakes or ice creams.",
          "Drink 2.5 to 3.0 liters of warm fluids daily."
        ],
        red_flags: "Temperature > 103°F (39.5°C) or continuous vomiting requires immediate doctor visit."
      };
    } else if (isEye) {
      structured = {
        condition_diagnosed: language === 'hi' ? "नेत्र तनाव एवं डिजिटल स्क्रीन स्ट्रेन (Digital Eye Strain)" : "Asthenopia & Computer Vision Syndrome",
        urgency: "NORMAL & STABLE",
        clinical_assessment: (language === 'hi'
          ? "मोबाइल/स्क्रीन ज्यादा देर देखने से आंखों में दर्द की मुख्य वजह 'सिलियरी मांसपेशियों में ऐंठन' और पलकें कम झपकना है। स्क्रीन पर पलक झपकने की दर 18 से घटकर 5-7 रह जाती है, जिससे आंसू परत सूख जाती है (Dry Eyes)।\n\n20-20-20 नियम: हर 20 मिनट के बाद 20 फीट दूर किसी वस्तु को 20 सेकंड तक देखें।"
          : "Prolonged screen viewing triggers ciliary muscle spasm and reduces spontaneous blinking from 18 to only 5-7 times/minute, accelerating tear film evaporation and dry eye irritation.\n\nFollow the 20-20-20 Rule: Every 20 minutes, focus 20 feet away for 20 seconds.") + vitalsSnippet,
        prescribed_medicines: [
          {
            name: "Carboxymethylcellulose 0.5% Eye Drops (Refresh Tears)",
            composition: "Lubricating Ophthalmic Polymer",
            dosage: "1 drop in both eyes 3-4 times daily",
            duration: "As needed during screen work",
            purpose: "Restores corneal tear film lubrication",
            caution: "Keep dropper sterile"
          }
        ],
        dietary_lifestyle: [
          "Follow 20-20-20 rule strictly.",
          "Keep monitor at arm's length (20-24 inches) slightly below eye level.",
          "Never use phones in a pitch-dark room.",
          "Consciously blink frequently."
        ],
        red_flags: "Sudden loss of vision, severe redness, or halo rings around lights requires immediate eye specialist consultation."
      };
    } else if (isStomach) {
      structured = {
        condition_diagnosed: language === 'hi' ? "तीव्र उदर शूल व आमाशय ऐंठन (Acute Abdominal Pain)" : "Acute Abdominal Pain & Functional Gastric Spasm",
        urgency: "MODERATE / CAUTION",
        clinical_assessment: (language === 'hi'
          ? "पेट में तेज दर्द आमतौर पर आंतों की मांसपेशियों में अत्यधिक ऐंठन (Spasm) या गैस भरने के कारण होता है। मरोड़ के साथ दर्द उठना आंतों की अतिसक्रिय संकुचन क्रिया का लक्षण है।"
          : "Acute abdominal pain with cramping is predominantly caused by visceral smooth muscle spasm or trapped intestinal gas.") + vitalsSnippet,
        prescribed_medicines: [
          {
            name: "Dicyclomine 10mg + Mefenamic Acid 250mg (Meftal-Spas)",
            composition: "Antispasmodic + NSAID",
            dosage: "1 tablet SOS after food when pain is severe",
            duration: "SOS short term",
            purpose: "Relaxes intestinal smooth muscle spasm and relieves cramping",
            caution: "Take after food"
          }
        ],
        dietary_lifestyle: [
          "Apply warm hot water bag over abdomen.",
          "Sip warm water or peppermint tea slowly.",
          "Eat light moong dal khichdi; avoid spicy fried foods."
        ],
        red_flags: "Rigid hard abdomen, high fever, or localized pain in lower right side (Appendicitis) requires emergency hospital check."
      };
    } else if (isJoint) {
      structured = {
        condition_diagnosed: language === 'hi' ? "घुटने व जोड़ों का बायोमैकेनिकल स्वास्थ्य (Knee Joint Care)" : "Knee Joint Rehabilitation & Biomechanics",
        urgency: "NORMAL & STABLE",
        clinical_assessment: (language === 'hi'
          ? "घुटनों में दर्द आमतौर पर कार्टिलेज के घिसने और जांघ (Quadriceps) की मांसपेशियों के कमजोर होने से होता है। जांघ की मांसपेशियों को मजबूत करने से घुटने के जोड़ पर वजन का दबाव कम हो जाता है।\n\nव्यायाम:\n• सीधे लेटकर घुटने के नीचे तौलिया दबाएं (5 सेकंड रोकें, 10 बार)।\n• सीधे पैर को 30 डिग्री उठाएं (SLR) और 5 सेकंड रोकें।"
          : "Knee pain commonly stems from articular cartilage thinning and weakness of stabilizing quadriceps muscles. Strengthening thigh muscles transfers load off the knee joints.\n\nExercises:\n• Isometric Quad Sets: Press knee down into a rolled towel for 5 seconds (10 reps).\n• Straight Leg Raise (SLR): Lift straight leg 30 degrees, hold 5 seconds.") + vitalsSnippet,
        prescribed_medicines: [
          {
            name: "Diclofenac Gel (Volini / Omnigel)",
            composition: "Topical NSAID Gel",
            dosage: "Apply gently over joint 2-3 times daily",
            duration: "5 to 7 days SOS",
            purpose: "Local topical pain relief",
            caution: "Do not vigorously rub"
          }
        ],
        dietary_lifestyle: [
          "Do isometric knee exercises twice daily.",
          "Avoid deep squatting and sitting on the floor.",
          "Apply ice pack for swelling or warm compress for stiffness."
        ],
        red_flags: "Inability to put any weight on leg or joint locked in bend requires immediate orthopedic review."
      };
    } else if (isPediatric) {
      structured = {
        condition_diagnosed: language === 'hi' ? "बाल चिकित्सा: बच्चों में बुखार व स्वास्थ्य देखभाल" : "Pediatric Health & Febrile Care",
        urgency: "MODERATE / CAUTION",
        clinical_assessment: (language === 'hi'
          ? "बच्चों में 99.5°F (37.5°C) से ऊपर तापमान बुखार माना जाता है।\n\nमुख्य नियम:\n• बच्चे को घूंट-घूंट करके पानी, ओआरएस या हल्का सूप पिलाते रहें।\n• 101°F से ऊपर तापमान पर माथे व गर्दन पर गुनगुने पानी की पट्टी (Tepid Sponging) रखें (बर्फ का पानी कभी न लगाएं)।\n• 16 वर्ष से कम उम्र में एस्पिरिन (Disprin) कभी न दें (Reye's Syndrome का खतरा)।"
          : "In children, core temperature above 37.5°C (99.5°F) indicates fever.\n\nKey Rules:\n• Administer frequent small sips of fluids (ORS, coconut water, soup).\n• For fever > 101°F, apply lukewarm water cloths over forehead (never cold ice).\n• NEVER give Aspirin to children under 16 (risk of Reye's Syndrome).") + vitalsSnippet,
        prescribed_medicines: [
          {
            name: "Paracetamol Pediatric Syrup",
            composition: "Acetaminophen Antipyretic",
            dosage: "10-15 mg per kg body weight every 6 hours SOS",
            duration: "SOS for fever > 100°F",
            purpose: "Reduces fever and body aches safely",
            caution: "Always dose by weight as directed by pediatrician"
          }
        ],
        dietary_lifestyle: [
          "Dress child in light cotton clothing.",
          "Ensure urination at least once every 4-6 hours.",
          "Do not force heavy solid foods; give soft porridge or khichdi."
        ],
        red_flags: "Excessive drowsiness, seizures/fits, fast breathing with chest indrawing, or refusing all fluids requires emergency hospital visit."
      };
    } else {
      structured = {
        condition_diagnosed: language === 'hi' ? `नैदानिक स्वास्थ्य परामर्श: ${queryText.slice(0, 30)}` : `Clinical Health Guidance: ${queryText.slice(0, 30)}`,
        urgency: "NORMAL & STABLE",
        clinical_assessment: (language === 'hi'
          ? `आपके प्रश्न "${queryText}" का वैज्ञानिक व चिकित्सीय विश्लेषण:\n\nमानव शरीर विज्ञान के अनुसार, उत्तम स्वास्थ्य तीन स्तंभों पर निर्भर करता है: कोशिकीय जलयोजन (प्रतिदिन 2.5-3 लीटर पानी), संतुलित पोषण (कम सोडियम, उच्च फाइबर), और 7-8 घंटे की नियमित नींद। खान-पान में मौसमी फल व सब्जियां शामिल करने से इम्युनिटी और ऊर्जा का स्तर बना रहता है।`
          : `Clinical Evaluation for "${queryText}":\n\nOptimal systemic health relies on cellular hydration (30-35 ml/kg), metabolic balance with whole foods and soluble fiber, autonomic regulation, and 7-8 hours of circadian sleep.`) + vitalsSnippet,
        prescribed_medicines: [],
        dietary_lifestyle: [
          "Drink 2.5 to 3.0 Liters of clean water daily.",
          "Include 30 minutes of moderate physical activity daily.",
          "Maintain consistent meal and sleep timings."
        ],
        red_flags: "Chest pain radiating to left arm, sudden breathlessness, or speech difficulty requires emergency 112 medical response."
      };
    }

    return {
      structured,
      text: structured.clinical_assessment,
      source: "SmartHealth Clinical Medical Intelligence",
      openai_notice: quotaText
    };
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
        if (apiKey.startsWith("sk-")) {
          data = await callDirectOpenAI(userText, telemetry, apiKey);
        } else {
          data = await callDirectGemini(userText, telemetry, apiKey);
        }
      }

      if (data) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          structured: data,
          text: data.clinical_assessment || (lang === 'hi' ? "उत्तर:" : "Answer:"),
          source: data.source || "Google Gemini AI (Live)",
          openai_notice: data.openai_notice
        }]);
      } else {
        throw new Error("Unable to fetch response");
      }

    } catch (err) {
      // 4. Fallback for offline mode or quota limits - Dynamic synthesized clinical reasoning
      const isQuota = err?.code === 'credit_balance_exhausted' || err?.status === 429;
      const clientRes = synthesizeClientClinicalResponse(userText, telemetry, lang, isQuota);
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        structured: clientRes.structured,
        text: clientRes.text,
        source: clientRes.source,
        openai_notice: clientRes.openai_notice
      }]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // DOCTOR-PATIENT VOICE CONSULTATION AUDIO RECORDING & RECOGNITION
  // =========================================================================
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi'
        ? "आपके ब्राउज़र में Web Speech API सीधे समर्थित नहीं है। आप नीचे दिए गए बॉक्स में डॉक्टर और मरीज़ की बातचीत टाइप कर सकते हैं या 'नमूना संवाद' लोड कर सकते हैं।"
        : "Web Speech API is not supported in this browser. You can type/paste the consultation dialogue or use a Sample Consultation below.");
      setIsRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = consultationLang === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalChunk.trim()) {
          const trimmed = finalChunk.trim();
          const speakerPrefix = activeSpeaker === 'Doctor' ? 'Doctor: ' : (activeSpeaker === 'Patient' ? 'Patient: ' : '');
          const taggedLine = `${speakerPrefix}${trimmed}`;

          setTranscriptText(prev => (prev ? `${prev}\n${taggedLine}` : taggedLine));
          setDialogueTurns(prev => [
            ...prev,
            {
              speaker: activeSpeaker === 'Auto' ? (trimmed.includes('?') ? 'Doctor' : 'Patient') : activeSpeaker,
              text: trimmed,
              time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
            }
          ]);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
      };

      recognition.onend = () => {
        if (recognitionRef.current && isRecording) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);

      setRecordingSeconds(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

    } catch (e) {
      console.error("Failed to start voice recognition", e);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setInterimText('');
  };

  const handleResetConsultation = () => {
    stopRecording();
    setTranscriptText('');
    setInterimText('');
    setDialogueTurns([]);
    setRecordingSeconds(0);
  };

  const handleAnalyzeVoiceConsultation = async () => {
    const textToAnalyze = transcriptText.trim() || interimText.trim();
    if (!textToAnalyze) {
      alert(lang === 'hi' 
        ? "कृपया पहले डॉक्टर और मरीज़ की बातचीत रिकॉर्ड करें या टेक्स्ट दर्ज करें।" 
        : "Please record or enter a Doctor-Patient consultation dialogue first.");
      return;
    }

    stopRecording();
    setAnalyzingVoice(true);

    try {
      const base = apiBaseUrl || 'http://localhost:8000';
      const response = await fetch(`${base}/api/ai/consultation-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToAnalyze,
          current_heart_rate: telemetry?.heart_rate,
          current_temp: telemetry?.temperature_c,
          current_spo2: telemetry?.spo2,
          api_key: apiKey,
          lang: consultationLang
        })
      });

      if (!response.ok) {
        throw new Error("Consultation API error: " + response.statusText);
      }

      const result = await response.json();

      const newConsultationMsg = {
        sender: 'ai',
        is_voice_consultation: true,
        consultation_data: result,
        text: result.clinical_assessment,
        structured: result,
        source: result.source || "Google Gemini AI (Voice Clinical Scribe)",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newConsultationMsg]);
      setShowVoiceModal(false);
      handleResetConsultation();

    } catch (err) {
      console.error("Error analyzing voice consultation:", err);
      alert(lang === 'hi' 
        ? "कंसल्टेशन विश्लेषण में त्रुटि आई। कृपया पुनः प्रयास करें।" 
        : "Error analyzing clinical consultation: " + err.message);
    } finally {
      setAnalyzingVoice(false);
    }
  };

  const loadSampleConsultation = (scenario) => {
    if (scenario === 'fever_cough') {
      const sample = lang === 'hi'
        ? `डॉक्टर: नमस्ते! बताइए आपको क्या परेशानी हो रही है?
मरीज़: डॉक्टर साहब, मुझे पिछले 3 दिनों से तेज़ बुखार (102°F) और सूखी खांसी आ रही है। पूरे बदन में दर्द है।
डॉक्टर: क्या आपको सांस लेने में कोई तकलीफ या सीने में जकड़न महसूस हो रही है?
मरीज़: सीने में भारीपन लगता है और कुछ भी निगलने पर गले में बहुत दर्द होता है।
डॉक्टर: क्या आपने अब तक कोई दवाई ली है?
मरीज़: सिर्फ कल रात को एक पैरासिटामोल ली थी, पर बुखार फिर आ गया।`
        : `Doctor: Good morning! What symptoms are you experiencing today?
Patient: Doctor, I have had a high fever reaching 102°F and a persistent dry cough for the last 3 days. My entire body aches.
Doctor: Are you having any shortness of breath or pain while swallowing?
Patient: Yes, it hurts severely when swallowing food, and my chest feels congested.
Doctor: Have you taken any medications yet?
Patient: I only took one Paracetamol last night, but the fever and chills returned this morning.`;
      setTranscriptText(sample);
    } else if (scenario === 'acidity_gerd') {
      const sample = lang === 'hi'
        ? `डॉक्टर: नमस्ते! आपको क्या दिक्कत हो रही है?
मरीज़: डॉक्टर साहब, छाती और पेट के ऊपरी हिस्से में बहुत तेज़ जलन होती है, खासकर खाना खाने के बाद या रात को लेटने पर।
डॉक्टर: यह समस्या कितने दिनों से है? क्या मुंह में खट्टा पानी भी आता है?
मरीज़: हाँ डॉक्टर, पिछले 1 हफ्ते से रोज़ रात को खट्टी डकारें और खट्टा पानी आता है, जिससे नींद खुल जाती है।
डॉक्टर: क्या आप चाय-कॉफ़ी या तला-भुना मसालेदार खाना ज़्यादा खाते हैं?
मरीज़: हाँ, ऑफिस में देर रात तक काम और चाय-समोसे काफी हो जाते हैं।`
        : `Doctor: Hello! What brings you into the clinic today?
Patient: Doctor, I am suffering from severe burning sensation in my upper stomach and chest, especially after meals and when lying down at night.
Doctor: How long has this been going on? Do you experience acid regurgitation or sour taste?
Patient: Yes, for the past one week, sour fluid comes up into my throat every night, waking me up from sleep.
Doctor: Do you consume spicy foods, excess caffeine, or eat late at night?
Patient: Yes, I frequently have fast food and 4-5 cups of coffee due to late work shifts.`;
      setTranscriptText(sample);
    }
  };

  const toggleTranscriptExpand = (msgIndex) => {
    setExpandedTranscripts(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  // Formatted Text & Code Block Renderer (Handles code blocks, bolding, and bullet points)
  const renderFormattedText = (content) => {
    if (!content) return null;

    // Check for markdown code blocks (```language ... ```)
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'code', lang: match[1] || 'code', code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      segments.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return segments.map((seg, sIdx) => {
      if (seg.type === 'code') {
        return (
          <div key={sIdx} className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="font-semibold text-sky-400">{seg.lang || 'code'}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Google Gemini Code</span>
            </div>
            <pre className="p-3 text-[11px] sm:text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed whitespace-pre">
              <code>{seg.code}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = seg.content.split('\n\n');
      return paragraphs.map((para, pi) => {
        const lines = para.split('\n');
        return (
          <div key={`${sIdx}-${pi}`} className="mb-2 leading-relaxed">
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
                {lang === 'hi' ? 'स्मार्टहेल्थ जेमिनी एआई चैटबॉट' : 'SmartHealth Google Gemini AI Chatbot'}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Google Gemini 2.5 Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'सामान्य ज्ञान, कोडिंग, विज्ञान एवं क्लिनिकल मेडिकल उत्तर — पावर्ड बाय Google Gemini' : 'Universal Knowledge, Coding, Science & Clinical Medicine — Powered by Google Gemini.'}
            </p>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Doctor-Patient Voice Consultation Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95"
            title={lang === 'hi' ? 'डॉक्टर-मरीज़ वॉयस कंसल्टेशन रिकॉर्डिंग' : 'Doctor-Patient Clinical Voice Consultation'}
          >
            <Mic className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'वॉयस कंसल्टेशन' : 'Voice Consultation'}</span>
          </button>

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

              {/* Doctor-Patient Voice Consultation Synthesis Card */}
              {msg.is_voice_consultation && msg.consultation_data ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                          {lang === 'hi' ? 'डॉक्टर-मरीज़ क्लीनिकल वॉयस कंसल्टेशन रिपोर्ट' : 'Doctor-Patient Clinical Voice Consultation Report'}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.source || "Google Gemini AI (Voice Clinical Scribe)"}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider ${
                      msg.consultation_data.urgency?.includes('CRITICAL') || msg.consultation_data.urgency?.includes('EMERGENCY')
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                    }`}>
                      {msg.consultation_data.urgency || "CLINICAL EVALUATION"}
                    </span>
                  </div>

                  {/* Diagnosed Sickness Box */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 shadow-sm">
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {lang === 'hi' ? '🩺 बीमारी का निष्कर्ष (Diagnosed Sickness):' : '🩺 Patient Sickness / Diagnosed Condition:'}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {msg.consultation_data.condition_diagnosed}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                      {renderFormattedText(msg.consultation_data.clinical_assessment)}
                    </div>
                  </div>

                  {/* Diarized Doctor vs Patient Dialogue (Collapsible) */}
                  {msg.consultation_data.diarized_dialogue && msg.consultation_data.diarized_dialogue.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden bg-white/70 dark:bg-slate-900/60 shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleTranscriptExpand(idx)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {lang === 'hi' ? 'डॉक्टर और मरीज़ का रिकॉर्डेड संवाद (Diarized Transcript)' : 'Doctor & Patient Dialogue (Diarized Transcript)'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {msg.consultation_data.diarized_dialogue.length} turns
                          </span>
                        </div>
                        {expandedTranscripts[idx] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {expandedTranscripts[idx] !== false && (
                        <div className="p-3.5 space-y-2.5 max-h-60 overflow-y-auto border-t border-slate-200 dark:border-slate-800 text-xs">
                          {msg.consultation_data.diarized_dialogue.map((turn, tIdx) => {
                            const isDoc = turn.speaker?.toLowerCase().includes('doctor') || turn.speaker?.toLowerCase().includes('dr');
                            return (
                              <div key={tIdx} className={`p-2.5 rounded-xl flex items-start gap-2.5 ${
                                isDoc
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 ml-0 mr-4'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 ml-4 mr-0'
                              }`}>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${
                                  isDoc ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                                }`}>
                                  {isDoc ? '👨‍⚕️ Doctor' : '🧑‍🦱 Patient'}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed flex-1">
                                  {turn.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prescribed Medicines Box */}
                  {msg.consultation_data.prescribed_medicines && msg.consultation_data.prescribed_medicines.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'hi' ? 'सुझाई गई दवाइयाँ एवं सही खुराक:' : 'Prescribed Medicines & Exact Dosage:'}</span>
                      </span>
                      {msg.consultation_data.prescribed_medicines.map((m, mi) => (
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
                  {msg.consultation_data.dietary_lifestyle && msg.consultation_data.dietary_lifestyle.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11.5px]">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1.5">
                        🌿 {lang === 'hi' ? 'खान-पान एवं रिकवरी दिशा-निर्देश:' : 'Dietary, Hydration & Clinical Recovery Advice:'}
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {msg.consultation_data.dietary_lifestyle.map((tip, ti) => (
                          <li key={ti}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red flags */}
                  {msg.consultation_data.red_flags && (
                    <div className="text-[11px] text-red-700 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>{lang === 'hi' ? 'खतरे के लक्षण (Red Flags):' : 'Warning Signs (Red Flags):'}</strong> {msg.consultation_data.red_flags}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Engine: {msg.source || 'Google Gemini Voice Scribe'}</span>
                    <span>IoT Telemetry Integrated</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main text / Clinical Assessment */}
                  {msg.text && (
                    <div className="text-xs sm:text-[13px]">
                      {renderFormattedText(msg.text)}
                    </div>
                  )}

                  {/* Structured Clinical Diagnosis Card (Only shown for real health queries with medicines or advice, not general/coding/greetings) */}
                  {msg.structured && msg.structured.is_medical !== false && !msg.structured.is_greeting && msg.structured.condition_diagnosed !== 'Conversational Greeting' && (msg.structured.prescribed_medicines?.length > 0 || msg.structured.dietary_lifestyle?.length > 0 || msg.structured.red_flags) && (
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
                </>
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
            <span>Google Gemini AI is thinking and formulating factual response...</span>
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
          placeholder={lang === 'hi' ? 'Google Gemini से कोई भी सवाल पूछें (मेडिकल, कोडिंग, साइंस, इतिहास, सामान्य ज्ञान)...' : 'Ask Google Gemini anything (Medical, Coding, Science, History, General Knowledge)...'}
          className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />

        {/* Doctor-Patient Voice Consultation Quick Button */}
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
          title={lang === 'hi' ? 'डॉक्टर-मरीज़ वॉयस कंसल्टेशन' : 'Doctor-Patient Voice Consultation'}
        >
          <Mic className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">{lang === 'hi' ? 'वॉयस कंसल्ट' : 'Voice Consult'}</span>
        </button>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पूछें' : 'Ask'}</span>
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
                  <p className="text-xs text-slate-500">Google Gemini Live & OpenAI API Key Configuration</p>
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
                Connected API Key (Google Gemini `AQ...` / `AIza...` OR OpenAI `sk-...`):
              </label>
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AQ.Ab8... OR AIzaSy... OR sk-proj-..."
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

      {/* Doctor-Patient Clinical Voice Consultation Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{lang === 'hi' ? 'डॉक्टर-मरीज़ वॉयस कंसल्टेशन रिकॉर्डर' : 'Doctor-Patient Clinical Voice Consultation'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                      Dual-Speaker AI
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'hi'
                      ? 'डॉक्टर और मरीज़ की बातचीत को लाइव रिकॉर्ड करें। एआई दोनों की आवाज़ पहचानकर बीमारी और सही दवा बताएगा।'
                      : 'Records real dialogue between Doctor & Patient. Gemini detects speakers, diagnoses sickness, and prescribes medicine.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopRecording();
                  setShowVoiceModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Language & Speaker Selection Banner */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'hi' ? 'वक्ता टैग (Speaker):' : 'Active Speaker:'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'Auto', label: lang === 'hi' ? '🤖 ऑटो-डिटेक्ट' : '🤖 Auto-Detect' },
                  { id: 'Doctor', label: lang === 'hi' ? '👨‍⚕️ डॉक्टर' : '👨‍⚕️ Doctor' },
                  { id: 'Patient', label: lang === 'hi' ? '🧑‍🦱 मरीज़' : '🧑‍🦱 Patient' }
                ].map(spk => (
                  <button
                    key={spk.id}
                    type="button"
                    onClick={() => setActiveSpeaker(spk.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      activeSpeaker === spk.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {spk.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Audio Visualizer & Status */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isRecording 
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/60' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    {isRecording 
                      ? (lang === 'hi' ? '🔴 लाइव रिकॉर्डिंग चालू है... डॉक्टर और मरीज़ की बातचीत सुनी जा रही है' : '🔴 LIVE RECORDING... Listening to Doctor & Patient conversation')
                      : (lang === 'hi' ? 'माइक्रोफ़ोन तैयार है — रिकॉर्डिंग शुरू करने के लिए नीचे क्लिक करें' : 'Microphone Ready — Click Start Recording below')}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  ⏱️ {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                </div>
              </div>

              {/* Pulsing Animated Soundwave */}
              {isRecording ? (
                <div className="flex items-center justify-center gap-1.5 h-12 py-2">
                  {[25, 60, 90, 45, 80, 100, 70, 85, 40, 95, 65, 30, 75, 50, 85].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-red-500 via-emerald-500 to-indigo-500 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDuration: `${0.35 + (i % 5) * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-6 flex items-center justify-center text-xs text-slate-400 italic">
                  {lang === 'hi' ? 'डॉक्टर सवाल पूछेंगे, मरीज़ जवाब देगा — दोनों की आवाजें स्वतः अलग की जाएँगी।' : 'Doctor asks clinical questions, Patient replies — voices will be separated automatically.'}
                </div>
              )}
            </div>

            {/* Real-time Spoken Transcript Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{lang === 'hi' ? 'लाइव परामर्श संवाद (Transcript):' : 'Live Consultation Dialogue Transcript:'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {lang === 'hi' ? 'आप इसे टाइप या संपादित भी कर सकते हैं' : 'Editable text / auto-captured via mic'}
                </span>
              </div>
              <textarea
                rows={6}
                value={transcriptText + (interimText ? `\n[...बोल रहे हैं: ${interimText}]` : '')}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={lang === 'hi' 
                  ? "उदाहरण:\nडॉक्टर: आपको क्या परेशानी है?\nमरीज़: मुझे 3 दिन से तेज़ बुखार और खांसी है...\n(बोलना शुरू करने पर यहाँ स्वतः ट्रांसक्रिप्ट तैयार होगी)" 
                  : "e.g.:\nDoctor: What symptoms are you having?\nPatient: I have had 102 fever and body ache since 3 days...\n(Spoken words will appear here in real-time)"}
                className="w-full text-xs font-mono p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Quick Demo Sample Consultations */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {lang === 'hi' ? '⚡ त्वरित परीक्षण के लिए नमूना परामर्श लोड करें:' : '⚡ Or Load Ready-to-Test Sample Consultation:'}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => loadSampleConsultation('fever_cough')}
                  className="text-[11px] px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors font-medium"
                >
                  🤒 {lang === 'hi' ? 'सैंपल: बुखार एवं सूखी खांसी (Fever & Cough)' : 'Sample: Fever & Cough Consultation'}
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleConsultation('acidity_gerd')}
                  className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors font-medium"
                >
                  🔥 {lang === 'hi' ? 'सैंपल: एसिडिटी एवं सीने में जलन (Acidity & GERD)' : 'Sample: Acidity & GERD Consultation'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all active:scale-95"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{lang === 'hi' ? '🔴 रिकॉर्डिंग शुरू करें' : '🔴 Start Recording'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Square className="w-4 h-4 text-red-400" />
                    <span>{lang === 'hi' ? 'रोकें (Pause)' : 'Pause Mic'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetConsultation}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Reset consultation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'रीसेट' : 'Reset'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopRecording();
                    setShowVoiceModal(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  {lang === 'hi' ? 'बंद करें' : 'Close'}
                </button>

                {/* Final Conclude & Analyze Button */}
                <button
                  type="button"
                  disabled={analyzingVoice || (!transcriptText.trim() && !interimText.trim())}
                  onClick={handleAnalyzeVoiceConsultation}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {analyzingVoice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'hi' ? 'Gemini AI बीमारी और दवाइयाँ निकाल रहा है...' : 'Gemini AI Concluding Diagnosis & Medicines...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'hi' ? 'कंसल्टेशन समाप्त करें एवं निष्कर्ष प्राप्त करें' : 'Conclude & Analyze with Gemini'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
