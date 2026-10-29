import React from 'react';
import { Globe, ExternalLink, Phone, ShieldCheck, CheckCircle2, FileText, HeartHandshake } from 'lucide-react';

export function GovSchemes({ govSchemes, lang }) {
  return (
    <div className="health-card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'hi' ? 'सरकारी स्वास्थ्य योजनाएं एवं आपातकालीन पोर्टल' : 'Government Health Portals & Public Schemes'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'आयुष्मान भारत (PM-JAY), जन औषधि, 108 एम्बुलेंस और ई-रक्तकोश ब्लड बैंक' : 'Official National Health Authority programs, cashless insurance, cheap generic medicine & blood portals.'}
            </p>
          </div>
        </div>

        <span className="badge badge-green">
          Official Govt of India
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {govSchemes?.map((scheme) => (
          <div
            key={scheme.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {scheme.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {scheme.authority}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2">
                {scheme.scheme_name}
              </h4>

              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mb-3">
                {scheme.description}
              </p>

              {/* Benefits highlight */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Benefits:</strong> {scheme.benefits}</span>
                </div>
              </div>
            </div>

            {/* Helpline and Portal Link */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <a
                href={`tel:${scheme.helpline_number.split('/')[0].trim()}`}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{scheme.helpline_number.split('/')[0].trim()}</span>
              </a>

              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
