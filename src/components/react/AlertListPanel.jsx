import React, { useMemo } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  CloudRain,
  Flame,
  Wind,
  Waves,
  Activity,
  Info,
  History,
} from "lucide-react";
import clsx from "clsx";

// Map categories to icons
const CATEGORY_ICONS = {
  Met: CloudRain,
  Fire: Flame,
  Geo: Activity,
  Marine: Waves,
  Safety: AlertTriangle,
  Health: Activity,
  Env: Info,
  Transport: Info,
  Other: Info,
};

const SEVERITY_COLORS = {
  Extreme: "border-l-4 border-red-600 bg-red-50 dark:bg-red-900/10",
  Severe: "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10",
  Moderate: "border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10",
  Minor: "border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/10",
  Unknown: "border-l-4 border-slate-300 bg-slate-50 dark:bg-slate-800/50",
};

export default function AlertListPanel({
  alerts = [],
  onAlertSelect,
  selectedAlertId,
  searchTerm,
  onSearchChange,
  onFilterClick,
}) {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-NZ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              New Zealand
              <br />
              Emergency Alert Archive
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {alerts.length} historical events preserved
            </p>
          </div>
          <button
            onClick={onFilterClick}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg"
            title="Filter Alerts"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 dark:placeholder-slate-400 dark:text-white border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <Info className="mx-auto mb-2 opacity-50" size={32} />
            <p>No alerts match your search.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = CATEGORY_ICONS[alert.category] || Info;
            const isSelected = selectedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                onClick={() => onAlertSelect(alert)}
                className={clsx(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                  SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS["Unknown"],
                  isSelected
                    ? "ring-2 ring-blue-500 shadow-md scale-[1.02]"
                    : "hover:scale-[1.01]",
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Icon size={14} />
                    <span>{alert.category}</span>
                    <span>•</span>
                    <span>{alert.severity}</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(alert.sent)}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1 line-clamp-2">
                  {alert.title}
                </h3>

                {alert.timeline && alert.timeline.length > 1 && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <History size={12} />
                    <span>{alert.timeline.length} updates</span>
                  </div>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {alert.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* About / Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 pb-8 md:pb-4">
        <details className="group">
          <summary className="list-none flex justify-between items-center cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <span>About this Project</span>
            <span className="group-open:rotate-180 transition-transform duration-200">
              <Info size={16} />
            </span>
          </summary>
          <div className="mt-2 space-y-1">
            <p>A preservation project for historical emergency alerts.</p>
            <p className="pt-1">
              Created by{" "}
              <a
                href="https://joshmcarthur.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Josh McArthur
              </a>
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
