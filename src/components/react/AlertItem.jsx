import React from "react";
import {
  AlertTriangle,
  CloudRain,
  Flame,
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

/**
 * Individual alert item component for virtualization
 * Used by react-window's FixedSizeList
 */
const AlertItem = React.memo(({ index, style, alerts, selectedAlertId, onAlertSelect, formatDate }) => {
  const alert = alerts[index];

  if (!alert) return null;

  const Icon = CATEGORY_ICONS[alert.category] || Info;
  const isSelected = selectedAlertId === alert.id;

  return (
    <div style={style}>
      <div
        onClick={() => onAlertSelect(alert)}
        className={clsx(
          "p-3 mx-2 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
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
    </div>
  );
});

AlertItem.displayName = "AlertItem";

export default AlertItem;

