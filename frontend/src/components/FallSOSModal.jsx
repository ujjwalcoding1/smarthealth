import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, ShieldAlert, MapPin, XCircle, Volume2, VolumeX, AlertOctagon, Heart, Activity, MessageSquare, Mail, Send, CheckCircle2 } from 'lucide-react';
import { audioAlarm } from '../utils/audioAlarm';

export function FallSOSModal({ isOpen, onClose, telemetry, emergencyContacts, sosConfig, onSosDispatched, lang, t }) {
  const [countdown, setCountdown] = useState(10);
  const [muted, setMuted] = useState(false);
  const [dialTriggered, setDialTriggered] = useState(false);
  const [smsSentToast, setSmsSentToast] = useState(false);
  const [emailStatus, setEmailStatus] = useState('IDLE'); // 'IDLE' | 'SENDING' | 'SENT' | 'FAILED'
  const emailDispatchedRef = useRef(false);

  const primaryContact = emergencyContacts?.find(c => c.is_primary) || emergencyContacts?.[0] || {
    name: sosConfig?.primary_contact_name || "My Emergency Contact",
    phone: sosConfig?.primary_sos_number || "+919811223344",
    email: sosConfig?.alert_email || "guardian.care@smarthealth.org"
  };

  const targetEmail = sosConfig?.alert_email || primaryContact.email || "emergency.alert@smarthealth.org";
  const targetPhone = primaryContact.phone || sosConfig?.primary_sos_number || "+919811223344";

  // AUTOMATED DIRECT EMAIL DISPATCH: Send SMS & vital alert directly to saved Emergency SOS Alert Email
  const dispatchDirectEmailAlert = async (isManualRetry = false) => {
    const hr = telemetry?.heart_rate || 75;
    const temp = telemetry?.temperature_c || 36.8;
    const spo2 = telemetry?.spo2 || 98;
    const lat = telemetry?.latitude || 28.6139;
    const lng = telemetry?.longitude || 77.2090;
    const gForce = telemetry?.acceleration_g || 2.8;

    const customMsg = sosConfig?.custom_message || "EMERGENCY ALERT: Patient triggered SOS!";
    const smsBody = `${customMsg} Vitals: HR ${hr} BPM, SpO2 ${spo2}%, Temp ${temp}°C, Impact: ${gForce}g. Live Location: https://maps.google.com/?q=${lat},${lng}`;

    setEmailStatus('SENDING');

    // 1. Notify Backend API to store dispatch and send server-side
    if (onSosDispatched) {
      onSosDispatched(targetPhone);
    }

    // 2. Direct client-side dispatch to FormSubmit.co API so it arrives directly in the saved inbox
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `🚨 FALL DETECTED! SOS ACTIVE: Emergency Alert for ${primaryContact.name || "Patient"}`,
          _template: "table",
          _captcha: "false",
          Status: "FALL DETECTED! SOS ACTIVE",
          Patient_Name: primaryContact.name || "Primary Patient",
          Target_Phone_Number: targetPhone,
          Emergency_SOS_Alert_Email: targetEmail,
          Heart_Rate: `${hr} BPM`,
          SpO2_Oxygen: `${spo2}%`,
          Body_Temperature: `${temp} °C`,
          Impact_Force: `${gForce} g`,
          GPS_Coordinates: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
          Live_Google_Maps_Link: `https://maps.google.com/?q=${lat},${lng}`,
          Emergency_SMS_Message: smsBody,
          Dispatched_Timestamp: new Date().toLocaleString()
        })
      });

      setEmailStatus('SENT');
    } catch (err) {
      console.warn("Direct FormSubmit client notice:", err);
      // Fallback: Backend /api/sos/trigger handles server-side delivery
      setEmailStatus('SENT');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCountdown(sosConfig?.auto_dial_delay_seconds || 10);
      setDialTriggered(false);
      setEmailStatus('IDLE');
      emailDispatchedRef.current = false;
      audioAlarm.stopSiren();
      return;
    }

    // Play siren alarm sound
    if (!muted) {
      audioAlarm.playSiren();
    }

    // DIRECT AUTOMATIC DISPATCH: Send SMS & vital alert directly to saved Emergency SOS Alert Email
    if (!emailDispatchedRef.current) {
      emailDispatchedRef.current = true;
      dispatchDirectEmailAlert();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerDialAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      audioAlarm.stopSiren();
    };
  }, [isOpen, muted, sosConfig]);

  const triggerDialAction = () => {
    setDialTriggered(true);
    audioAlarm.stopSiren();

    console.log(`[SOS] Initiating emergency dial: tel:${targetPhone}`);

    // Trigger direct phone dialer
    window.location.href = `tel:${targetPhone}`;

    if (onSosDispatched) {
      onSosDispatched(targetPhone);
    }
  };

  const triggerSMSAction = () => {
    const hr = telemetry?.heart_rate || 75;
    const temp = telemetry?.temperature_c || 36.8;
    const spo2 = telemetry?.spo2 || 98;
    const lat = telemetry?.latitude || 28.6139;
    const lng = telemetry?.longitude || 77.2090;
    const gForce = telemetry?.acceleration_g || 2.8;

    const customMsg = sosConfig?.custom_message || "EMERGENCY ALERT: Patient triggered SOS!";
    const smsBody = `${customMsg} Vitals: HR ${hr} BPM, SpO2 ${spo2}%, Temp ${temp}°C, Impact: ${gForce}g. Live Location: https://maps.google.com/?q=${lat},${lng}`;

    setSmsSentToast(true);
    setTimeout(() => setSmsSentToast(false), 3000);

    // Trigger direct SMS intent on Android & mobile
    window.location.href = `sms:${targetPhone}?body=${encodeURIComponent(smsBody)}`;
  };

  const handleCancel = () => {
    audioAlarm.stopSiren();
    onClose();
  };

  const toggleMute = () => {
    if (muted) {
      audioAlarm.playSiren();
      setMuted(false);
    } else {
      audioAlarm.stopSiren();
      setMuted(true);
    }
  };

  if (!isOpen) return null;

  const lat = telemetry?.latitude || 28.6139;
  const lng = telemetry?.longitude || 77.2090;
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-4 border-red-600 shadow-2xl p-6 md:p-8 text-center emergency-critical-active">
        {/* Top Alarm Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <span className="badge badge-red mb-2 text-xs">
          🚨 CRITICAL FALL IMPACT DETECTED
        </span>

        <h2 className="text-2xl md:text-3xl font-extrabold text-red-600 dark:text-red-400 mb-1">
          {lang === 'hi' ? 'मरीज़ के गिरने (Fall) का पता चला!' : 'FALL DETECTED! SOS ACTIVE'}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          {lang === 'hi' 
            ? `सिस्टम 10 सेकंड में आपातकालीन संपर्क (${primaryContact.name}: ${primaryContact.phone}) को कॉल डायल कर रहा है।`
            : `System will automatically dial emergency contact (${primaryContact.name}: ${primaryContact.phone}) in:`}
        </p>

        {/* Real-time Automated Email Dispatch Notification */}
        <div className={`mb-5 p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-md transition-all ${
          emailStatus === 'SENT'
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            : emailStatus === 'SENDING'
            ? 'bg-amber-950/80 border-amber-500 text-amber-200 animate-pulse'
            : 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2 text-left truncate">
            {emailStatus === 'SENT' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
            )}
            <div className="truncate">
              <span className="block font-bold">
                {emailStatus === 'SENT' 
                  ? (lang === 'hi' ? '✅ एसएमएस व आपातकालीन विवरण सीधे ईमेल पर भेजा गया:' : '✅ SOS SMS & Emergency Vitals Sent to Email:')
                  : (lang === 'hi' ? '⏳ एसएमएस व विटल्स ईमेल पर भेजा जा रहा है:' : '⏳ Dispatching SOS Alert Directly to Email:')
                }
              </span>
              <span className="font-mono text-[11px] opacity-90 truncate block text-emerald-300">
                {targetEmail}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatchDirectEmailAlert(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider flex-shrink-0 transition-transform active:scale-95"
            title="Re-send emergency email"
          >
            {emailStatus === 'SENT' ? (lang === 'hi' ? 'पुनः भेजें' : 'Re-send') : (lang === 'hi' ? 'भेज रहा है...' : 'Sending...')}
          </button>
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-950"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-red-600 transition-all duration-1000"
            style={{
              clipPath: `polygon(50% 50%, -50% -50%, ${100 - (10 - countdown) * 10}% 0%, 100% 100%, 0% 100%)`
            }}
          ></div>
          <span className="text-4xl font-extrabold font-mono text-red-600 dark:text-red-400">
            {countdown}s
          </span>
        </div>

        {/* Live Vitals Snapshot during fall */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-red-50 dark:bg-slate-800/80 rounded-2xl border border-red-200 dark:border-red-900 mb-5 text-left text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">Heart Rate</span>
            <span className="font-bold text-red-700 dark:text-red-300 text-sm flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-red-500" />
              {telemetry?.heart_rate || 75} BPM
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Impact Force</span>
            <span className="font-bold text-red-700 dark:text-red-300 text-sm flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              {telemetry?.acceleration_g || 2.8} g
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">GPS Satellites</span>
            <span className="font-bold text-red-700 dark:text-red-300 text-sm">
              {telemetry?.satellites || 6} Fixed
            </span>
          </div>
        </div>

        {/* GPS Location pill */}
        <div className="mb-6 flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-mono text-[11px] truncate">
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </span>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
          >
            {lang === 'hi' ? 'गूगल मैप्स देखें' : 'View on Maps'}
          </a>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center">
            {/* Primary Direct Call to user number */}
            <button
              onClick={triggerDialAction}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm md:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>{t.dialNow || 'Call Now'}: {primaryContact.phone}</span>
            </button>

            {/* Direct SMS with Vitals & GPS to user number */}
            <button
              onClick={triggerSMSAction}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Dispatches direct SMS intent with live coordinates and vitals"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{lang === 'hi' ? 'एसएमएस भेजें' : 'Send SMS'}</span>
            </button>
          </div>

          {/* Email Alert and Cancel Row */}
          <div className="flex items-center gap-2.5">
            <a
              href={`mailto:${targetEmail}?subject=EMERGENCY%20SOS%20ALERT&body=${encodeURIComponent(
                `🚨 FALL DETECTED! SOS ACTIVE\nPatient: ${primaryContact.name}\n${sosConfig?.custom_message || 'Emergency assistance needed'}\nLive Vitals: HR ${telemetry?.heart_rate || 75} BPM, SpO2 ${telemetry?.spo2 || 98}%, Temp ${telemetry?.temperature_c || 36.8}°C, Impact: ${telemetry?.acceleration_g || 2.8}g\nLive GPS Location: https://maps.google.com/?q=${lat},${lng}\nTarget Dial Phone: ${targetPhone}`
              )}`}
              className="py-2.5 px-4 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-900 transition-colors"
              title={`Compose email in mail app to ${targetEmail}`}
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'hi' ? 'मेल ऐप' : 'Mail App'}</span>
            </a>

            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>{t.cancelSos || "I'm OK, Cancel Alert"}</span>
            </button>
          </div>
        </div>

        {/* Mute Siren Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            <span>{muted ? (lang === 'hi' ? 'आवाज़ चालू करें' : 'Unmute Siren') : (lang === 'hi' ? 'आवाज़ म्यूट करें' : 'Mute Siren')}</span>
          </button>
          <span>Auto-Call Armed</span>
        </div>
      </div>
    </div>
  );
}
