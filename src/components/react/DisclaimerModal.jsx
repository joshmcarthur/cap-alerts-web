import React from "react";
import { X, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function DisclaimerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200 dark:border-red-900/50">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 flex items-start justify-between border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Important Disclaimer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500"
            aria-label="Close disclaimer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-lg text-slate-900 dark:text-white">
            NOT FOR EMERGENCY USE
          </p>
          <p>
            This application is an archive of <strong>historical</strong> Common
            Alerting Protocol (CAP) messages for research, analysis, and
            educational purposes only.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              This site is <strong>NOT</strong> connected to any live emergency
              alert systems.
            </li>
            <li>Data may be incomplete, delayed, or inaccurate.</li>
            <li>
              <strong>NEVER</strong> rely on this application for safety
              decisions or emergency response.
            </li>
          </ul>
          <p className="text-sm text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            For current emergency information, always refer to official sources
            such as Civil Defence, MetService, or emergency services directly.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
