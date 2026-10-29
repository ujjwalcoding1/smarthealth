import React from 'react';
import { History, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

export function AlertsLog({ alerts, lang, t }) {
  const displayAlerts = alerts && alerts.length > 0 ? alerts : [
    {
      timestamp: "Today 10:15 AM",
      type: "NORMAL_CHECK",
      summary: "All vitals stable in GREEN Zone. Patient resting comfortably.",
      zone: "GREEN"
    },
    {
      timestamp: "Yesterday 08:30 PM",
      type: "YELLOW_WARNING",
      summary: "Mild fever (38.1°C) flagged. Paracetamol recommendation delivered.",
      zone: "YELLOW"
    }
  ];

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-white shadow-sm">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.alertAudit}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'स्वास्थ्य अलर्ट व आपातकालीन घटनाओं का इतिहास' : 'Audit trail of warning triggers & SOS dispatches'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
        {displayAlerts.map((al, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${
                al.zone === 'RED' ? 'bg-red-500' : al.zone === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {al.summary || al.message || 'System vital evaluation event'}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {al.timestamp}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              al.zone === 'RED' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : al.zone === 'YELLOW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {al.zone || 'EVENT'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
