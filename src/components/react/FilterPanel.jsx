import React from "react";
import { X, Check, Calendar } from "lucide-react";
import clsx from "clsx";

export default function FilterPanel({
  filterOptions,
  activeFilters,
  onFilterChange,
  onClose,
  onClearFilters,
}) {
  const sections = [
    { id: "severities", label: "Severity", options: filterOptions.severities },
    { id: "categories", label: "Category", options: filterOptions.categories },
    { id: "urgencies", label: "Urgency", options: filterOptions.urgencies },
    { id: "statuses", label: "Status", options: filterOptions.statuses },
    {
      id: "messageTypes",
      label: "Message Type",
      options: filterOptions.messageTypes,
    },
  ];

  const toggleFilter = (sectionId, value) => {
    const currentValues = activeFilters[sectionId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...activeFilters,
      [sectionId]: newValues,
    });
  };

  const handleDateChange = (type, value) => {
    // Convert string date (YYYY-MM-DD) to Date object or null
    // Ensure we set to noon to avoid timezone shift issues on day boundaries
    const dateValue = value ? new Date(value + "T12:00:00") : null;

    onFilterChange({
      ...activeFilters,
      dateRange: {
        ...activeFilters.dateRange,
        [type]: dateValue,
      },
    });
  };

  // Helper to format Date object to YYYY-MM-DD string for input
  const formatDateForInput = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Filters
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-2"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Date Range Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Date Range
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="filter-date-start"
                className="text-xs text-slate-500 block"
              >
                From
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none"
                  size={14}
                />
                <input
                  id="filter-date-start"
                  type="date"
                  value={formatDateForInput(activeFilters.dateRange?.start)}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="filter-date-end"
                className="text-xs text-slate-500 block"
              >
                To
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none"
                  size={14}
                />
                <input
                  id="filter-date-end"
                  type="date"
                  value={formatDateForInput(activeFilters.dateRange?.end)}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox Sections */}
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {section.label}
            </h3>
            <div className="space-y-2">
              {section.options.map((option) => {
                const isSelected = activeFilters[section.id]?.includes(option);
                return (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                  >
                    <div
                      className={clsx(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400",
                      )}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected || false}
                      onChange={() => toggleFilter(section.id, option)}
                    />
                    <span className="text-slate-700 dark:text-slate-200">
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
