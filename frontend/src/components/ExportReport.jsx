import React, { useState } from 'react';
import { Download, Printer, FileText, CheckCircle, X } from 'lucide-react';

export function ExportReport({ telemetry, zoneEvaluation, medicines, labReports, patientProfile, lang, t }) {
  const [showPreview, setShowPreview] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-700 text-white shadow-sm">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.exportReport}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'चिकित्सक परामर्श हेतु प्रिंट योग्य मेडिकल रिपोर्ट' : 'Generate printable PDF clinical summary for hospital/doctor visit'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'रिपोर्ट देखें / प्रिंट करें' : 'Preview & Print'}</span>
        </button>
      </div>

      {/* Printable Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white text-slate-900 p-8 shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-h-full print:p-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900 mb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  SMARTHEALTH CLINICAL TELEMETRY REPORT
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Generated: {new Date().toLocaleString()} | Cloud IoT System
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl mb-6 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <strong className="text-sm font-bold">{patientProfile?.name || "Rajesh Sharma"}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Age & Gender:</span>
                <strong className="text-sm font-bold">{patientProfile?.age || 58} Yrs / {patientProfile?.gender || "Male"}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Group:</span>
                <strong className="text-sm font-bold text-red-600">{patientProfile?.blood_group || "B+"}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Allergies:</span>
                <strong className="text-sm font-bold text-amber-700">Penicillin</strong>
              </div>
            </div>

            {/* Current Sensor Vitals */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Live Sensor Telemetry Snapshot (ESP32)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 block">Heart Rate</span>
                  <span className="text-xl font-bold font-mono">{telemetry?.heart_rate || 75} BPM</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 block">SpO2</span>
                  <span className="text-xl font-bold font-mono">{telemetry?.spo2 || 98}%</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 block">Body Temp</span>
                  <span className="text-xl font-bold font-mono">{telemetry?.temperature_c || 36.8}°C</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <span className="text-slate-500 block">Active Zone</span>
                  <span className={`text-base font-bold font-mono ${
                    zoneEvaluation?.zone === 'RED' ? 'text-red-600' : zoneEvaluation?.zone === 'YELLOW' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {zoneEvaluation?.zone || 'GREEN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Prescription List */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Current Prescriptions
              </h4>
              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Medication</th>
                    <th className="p-2">Dosage</th>
                    <th className="p-2">Timing</th>
                    <th className="p-2">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {medicines && medicines.map((m, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{m.name}</td>
                      <td className="p-2">{m.dosage}</td>
                      <td className="p-2">{m.timing} ({m.meal_relation})</td>
                      <td className="p-2 text-slate-600">{m.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>Digitally verified via SmartHealth Telemetry Cloud Hub</span>
              <span>Physician Reference Copy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
