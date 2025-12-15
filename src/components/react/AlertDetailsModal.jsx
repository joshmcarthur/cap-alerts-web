import React, { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Share2,
  Code,
  Copy,
  Check,
  History,
} from "lucide-react";
import clsx from "clsx";

export default function AlertDetailsModal({ alert, onClose }) {
  const [showXml, setShowXml] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!alert) return null;

  const handleCopyXml = async () => {
    if (alert.originalXml) {
      await navigator.clipboard.writeText(alert.originalXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareAlert = async () => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;
    const shareData = {
      title: alert.title,
      text: `${alert.title} - ${alert.severity} ${alert.category} Alert`,
      url: currentUrl,
    };

    // Check if Web Share API is available
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
        if (error.name !== "AbortError") {
          await copyUrlToClipboard();
        }
      }
    } else {
      // Fall back to clipboard
      await copyUrlToClipboard();
    }
  };

  const copyUrlToClipboard = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL to clipboard:", error);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-NZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Header with Image/Map placeholder or Severity Color */}
      <div
        className={clsx(
          "p-6 text-white shrink-0 relative @container",
          alert.severity === "Extreme"
            ? "bg-red-600"
            : alert.severity === "Severe"
              ? "bg-orange-600"
              : alert.severity === "Moderate"
                ? "bg-yellow-600"
                : "bg-blue-600",
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white cursor-pointer"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2 opacity-90">
          <span className="uppercase tracking-widest text-xs font-bold px-2 py-1 bg-black/20 rounded">
            {alert.severity} Severity
          </span>
          <span className="uppercase tracking-widest text-xs font-bold px-2 py-1 bg-black/20 rounded">
            {alert.category}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
          {alert.title}
        </h2>

        <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-4 text-sm opacity-90">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(alert.sent)}</span>
          </div>
          {alert.areaDesc && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="truncate max-w-[200px]">{alert.areaDesc}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 space-y-6">
        {/* Inline Disclaimer */}
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
          <AlertTriangle size={16} className="shrink-0" />
          <p className="font-medium">
            Historical alert archive. <strong>Not for emergency use.</strong>
          </p>
        </div>

        {/* Main Instruction */}
        <section>
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            Instruction
          </h3>
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {alert.description}
          </div>
        </section>

        {/* Metadata Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-400 uppercase block mb-1">
              Status
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {alert.status}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-400 uppercase block mb-1">
              Message Type
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {alert.msgType}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-400 uppercase block mb-1">
              Urgency
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {alert.urgency}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-400 uppercase block mb-1">
              Certainty
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {alert.certainty}
            </span>
          </div>
        </section>

        {/* Timeline Section */}
        {alert.timeline && alert.timeline.length > 1 && (
          <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
              <History size={16} />
              Alert History
            </h3>
            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
              {alert.timeline.map((item, index) => (
                <div key={item.id} className="relative">
                  <div
                    className={clsx(
                      "absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                      item.msgType === "Alert"
                        ? "bg-blue-500"
                        : item.msgType === "Update"
                          ? "bg-orange-500"
                          : item.msgType === "Cancel"
                            ? "bg-slate-500"
                            : "bg-gray-500",
                    )}
                  />
                  <div className="text-xs text-slate-500 mb-1">
                    {new Intl.DateTimeFormat("en-NZ", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(item.sent)}
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    {item.msgType}
                  </h4>
                  {item.description &&
                    item.description !== alert.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Source Reference & Technical Details */}
        <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
              <FileText size={16} />
              Source Reference
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyXml}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
                title="Copy original XML"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                onClick={() => setShowXml(!showXml)}
                className={clsx(
                  "p-1.5 rounded transition-colors",
                  showXml
                    ? "text-blue-600 bg-blue-50 dark:bg-slate-800"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800",
                )}
                title="View original XML"
              >
                <Code size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {/* Main Identifier */}
            <div>
              <span className="text-slate-400 font-medium block mb-1">
                Identifier
              </span>
              <code className="block bg-slate-100 dark:bg-slate-950 p-2 rounded text-slate-600 dark:text-slate-400 font-mono break-all">
                {alert.identifier}
              </code>
            </div>

            {/* Source (if available) */}
            {alert.source && (
              <div>
                <span className="text-slate-400 font-medium block mb-1">
                  Source
                </span>
                <code className="block bg-slate-100 dark:bg-slate-950 p-2 rounded text-slate-600 dark:text-slate-400 font-mono break-all">
                  {alert.source}
                </code>
              </div>
            )}

            {/* References (if available) */}
            {alert.references && (
              <div>
                <span className="text-slate-400 font-medium block mb-1">
                  References
                </span>
                <code className="block bg-slate-100 dark:bg-slate-950 p-2 rounded text-slate-600 dark:text-slate-400 font-mono break-all">
                  {alert.references}
                </code>
              </div>
            )}

            {/* Original XML Toggle */}
            {showXml && (
              <div className="mt-4">
                <span className="text-slate-400 font-medium block mb-1">
                  Original XML
                </span>
                <pre className="block bg-slate-900 text-slate-200 p-3 rounded overflow-x-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed max-h-[300px] overflow-y-auto">
                  {alert.originalXml}
                </pre>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end gap-2">
        <button
          onClick={handleShareAlert}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors shadow-sm",
            shared
              ? "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800"
              : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700",
          )}
        >
          {shared ? <Check size={18} /> : <Share2 size={18} />}
          <span className="text-sm font-medium">
            {shared ? "Copied!" : "Share Alert"}
          </span>
        </button>
      </div>
    </div>
  );
}
