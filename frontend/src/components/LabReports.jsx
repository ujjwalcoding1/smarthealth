import React, { useState } from 'react';
import { FileText, Plus, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export function LabReports({ labReports, onAddReport, lang, t }) {
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({
    test_name: '',
    date: 'Today',
    result_value: '',
    reference_range: '',
    status: 'Normal',
    category: 'Biochemistry'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReport.test_name) return;
    if (onAddReport) onAddReport(newReport);
    setShowModal(false);
  };

  return (
    <div className="health-card mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100">
              {t.labReports}
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'रक्त व पैथोलॉजी टेस्ट परिणाम' : 'Diagnostic pathology records & reference limits'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'रिपोर्ट जोड़ें' : 'Add Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {labReports && labReports.map((report) => (
          <div
            key={report.id}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>{report.category}</span>
              <span>{report.date}</span>
            </div>
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2 truncate">
              {report.test_name}
            </h5>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                {report.result_value}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 font-semibold">
                {report.status}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Ref: {report.reference_range}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
              Upload Pathology Record
            </h4>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HbA1c / Serum Electrolytes"
                  value={newReport.test_name}
                  onChange={e => setNewReport({ ...newReport, test_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Result Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.6%"
                    value={newReport.result_value}
                    onChange={e => setNewReport({ ...newReport, result_value: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Reference Range</label>
                  <input
                    type="text"
                    placeholder="e.g. < 5.7%"
                    value={newReport.reference_range}
                    onChange={e => setNewReport({ ...newReport, reference_range: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
