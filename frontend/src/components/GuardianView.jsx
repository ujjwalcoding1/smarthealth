import React, { useState } from 'react';
import { Users, Mail, MapPin, Heart, CheckCircle2, ShieldAlert, Clock, Send, Check, AlertCircle, FileText } from 'lucide-react';

export function GuardianView({ telemetry, zoneEvaluation, medicines, caregiverConfig, onSendEmailAlert, lang, t }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);

  const hr = telemetry?.heart_rate || 75;
  const temp = telemetry?.temperature_c || 36.8;
  const spo2 = telemetry?.spo2 || 98;
  const zone = zoneEvaluation?.zone || 'GREEN';

  const caregiverName = caregiverConfig?.caregiver_name || "Ananya (Daughter)";
  const caregiverEmail = caregiverConfig?.email || "guardian.care@smarthealth.org";
  const relationship = caregiverConfig?.relationship || "Primary Guardian";
  const doseTokens = caregiverConfig?.dose_tokens || [
    { id: "TKN-101", med_name: "Dolo 650mg", dosage: "1 tab", time: "08:30 AM", meal: "After Food", taken: true },
    { id: "TKN-102", med_name: "Telma 40mg", dosage: "1 tab", time: "01:30 PM", meal: "After Lunch", taken: false },
    { id: "TKN-103", med_name: "Atorva 10mg", dosage: "1 tab", time: "09:00 PM", meal: "At Bedtime", taken: false }
  ];

  const takenCount = doseTokens.filter(d => d.taken).length;
  const totalDoses = doseTokens.length;

  const handleSendEmail = async () => {
    setEmailSending(true);
    const subject = encodeURIComponent(`SmartHealth Lifeline Alert: Patient Status [${zone} ZONE]`);
    const body = encodeURIComponent(
      `Dear ${caregiverName},\n\n` +
      `Here is the latest live patient telemetry report from SmartHealth IoT Lifeline:\n` +
      `• Health Status Zone: ${zone} (${zoneEvaluation?.summary_message || 'Normal limits'})\n` +
      `• Live Heart Rate: ${hr} BPM\n` +
      `• Body Temperature: ${temp}°C\n` +
      `• Blood Oxygen (SpO2): ${spo2}%\n` +
      `• Medicine Dose Tokens Adherence: ${takenCount} of ${totalDoses} doses completed today.\n\n` +
      `Patient Location: https://maps.google.com/?q=${telemetry?.latitude || 28.6139},${telemetry?.longitude || 77.2090}\n\n` +
      `Sent via SmartHealth IoT Caregiver Remote Watch.`
    );

    // Open direct email composer
    window.open(`mailto:${caregiverEmail}?subject=${subject}&body=${body}`, '_blank');

    setEmailSending(false);
    setEmailSentToast(true);
    setTimeout(() => setEmailSentToast(false), 3000);
  };

  return (
    <div className="health-card mb-6 border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t?.caregiverView || 'Caregiver Remote Watch'}</span>
              <span className="badge badge-green text-[10px]">Active Watch</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' 
                ? 'परिवार और अभिभावक के लिए लाइव वाइटल्स और ईमेल अलर्ट पोर्टल' 
                : 'Live caregiver telemetry surveillance & email alert dispatch.'}
            </p>
          </div>
        </div>

        {/* Email Alert Button */}
        <button
          onClick={handleSendEmail}
          disabled={emailSending}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'ईमेल पर मैसेज भेजें' : 'Send Alert Email'}</span>
        </button>
      </div>

      {emailSentToast && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Email client opened with full patient telemetry report!</span>
        </div>
      )}

      {/* 3 Top Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
        {/* 1. Patient Safety Zone */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 block mb-0.5">Patient Safety Status</span>
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
            <span className={`w-2.5 h-2.5 rounded-full ${
              zone === 'RED' ? 'bg-red-500 animate-ping' : zone === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            <span>{zone} ZONE</span>
          </div>
          <span className="text-[10.5px] text-slate-400 block mt-1">HR: {hr} BPM • Temp: {temp}°C • SpO2: {spo2}%</span>
        </div>

        {/* 2. Medicine Dose Tokens Adherence */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 block mb-0.5">Dose Tokens Completed</span>
          <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
            {takenCount} of {totalDoses} Doses Taken
          </div>
          <span className="text-[10.5px] text-slate-400 block mt-1">
            {totalDoses - takenCount > 0 ? `${totalDoses - takenCount} doses remaining today` : 'All daily tokens completed!'}
          </span>
        </div>

        {/* 3. Caregiver Alert Email (Replaced Phone) */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-slate-500 block mb-0.5">Caregiver Alert Email</span>
            <strong className="text-slate-800 dark:text-slate-200 block text-xs truncate">
              {caregiverName} ({relationship})
            </strong>
            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 block truncate">
              ✉️ {caregiverEmail}
            </span>
          </div>
          <button
            onClick={handleSendEmail}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex-shrink-0"
            title="Compose Alert to Caregiver Email"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Medicine Dose Tokens Table */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Dose Tokens & Medication Schedule:</span>
          </span>
          <span className="text-[10.5px] text-slate-500">
            Managed via Admin Panel
          </span>
        </div>

        <div className="space-y-1.5">
          {doseTokens.map((token, i) => (
            <div
              key={token.id || i}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                token.taken 
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' 
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {token.id}
                </span>
                <strong className="text-slate-800 dark:text-slate-100 text-xs">{token.med_name}</strong>
                <span className="text-slate-500 text-[11px]">({token.dosage} • {token.meal})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{token.time}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  token.taken 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {token.taken ? 'Taken' : 'Scheduled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
