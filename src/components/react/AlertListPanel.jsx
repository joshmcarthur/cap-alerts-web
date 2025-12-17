import React, { useMemo, useRef, useEffect, useState } from "react";
import { List } from "react-window";
import { Search, Filter, Info } from "lucide-react";
import AlertItem from "./AlertItem.jsx";

export default function AlertListPanel({
  alerts = [],
  onAlertSelect,
  selectedAlertId,
  searchTerm,
  onSearchChange,
  onFilterClick,
}) {
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const [listHeight, setListHeight] = useState(600);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-NZ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Update list height when container size changes
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setListHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Scroll to selected alert when it changes
  useEffect(() => {
    if (selectedAlertId && listRef.current) {
      const index = alerts.findIndex((alert) => alert.id === selectedAlertId);
      if (index >= 0) {
        listRef.current.scrollToRow({ index, align: "smart" });
      }
    }
  }, [selectedAlertId, alerts]);

  // Prepare data for react-window
  const rowProps = useMemo(
    () => ({
      alerts,
      selectedAlertId,
      onAlertSelect,
      formatDate,
    }),
    [alerts, selectedAlertId, onAlertSelect],
  );

  // Estimate item height (adjust based on your actual item height)
  const ITEM_HEIGHT = 140; // Approximate height including margin

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

      {/* Virtualized Alert List */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <Info className="mx-auto mb-2 opacity-50" size={32} />
            <p>No alerts match your search.</p>
          </div>
        ) : (
          <List
          listRef={listRef}
          rowCount={alerts.length}
          rowHeight={ITEM_HEIGHT}
          rowComponent={AlertItem}
          rowProps={rowProps}
          style={{ height: listHeight }}
        />
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
