import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useAlertData } from "../../hooks/useAlertData.js";
import {
  applyFilters,
  createEmptyFilters,
  getFilterOptions,
} from "../../utils/alert-filters.js";
import AppLayout from "./AppLayout.jsx";
import MapLibreViewer from "./MapLibreViewer.jsx";
import AlertListPanel from "./AlertListPanel.jsx";
import AlertDetailsModal from "./AlertDetailsModal.jsx";
import FilterPanel from "./FilterPanel.jsx";
import DisclaimerModal from "./DisclaimerModal.jsx";

export default function AlertMapApp() {
  // Data loading
  const { alerts, loading, error, retryLoading } =
    useAlertData("/src/data/cap.csv");

  // State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState(createEmptyFilters());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Theme detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(mediaQuery.matches);

      const handler = (e) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Compute available filter options based on all alerts
  const filterOptions = useMemo(() => {
    return getFilterOptions(alerts);
  }, [alerts]);

  // Filter logic
  const filteredAlerts = useMemo(() => {
    // Merge search term into filters
    const activeFilters = {
      ...filters,
      searchText: searchTerm,
    };
    return applyFilters(alerts, activeFilters);
  }, [alerts, filters, searchTerm]);

  // Handlers
  const handleAlertSelect = useCallback((alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedAlert(null);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(createEmptyFilters());
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50 dark:bg-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading Alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Error Loading Data
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <button
            onClick={retryLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout
        sidebar={
          isFilterOpen ? (
            <FilterPanel
              filterOptions={filterOptions}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setIsFilterOpen(false)}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <AlertListPanel
              alerts={filteredAlerts}
              onAlertSelect={handleAlertSelect}
              selectedAlertId={selectedAlert?.id}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onFilterClick={() => setIsFilterOpen(true)}
            />
          )
        }
        detailsPanel={
          selectedAlert ? (
            <AlertDetailsModal
              alert={selectedAlert}
              onClose={handleCloseDetails}
            />
          ) : null
        }
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCloseDetails={handleCloseDetails}
        floatingControls={
          <button
            onClick={() => setShowDisclaimer(true)}
            className="absolute top-2 right-2 md:top-auto md:bottom-2 md:right-14 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group z-50"
            title="Important Disclaimer"
          >
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Not for Emergency Use
            </span>
          </button>
        }
      >
        <MapLibreViewer
          alerts={alerts}
          filteredAlerts={filteredAlerts}
          selectedAlert={selectedAlert}
          onAlertSelect={handleAlertSelect}
          isDarkMode={isDarkMode}
        />
      </AppLayout>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )}
    </>
  );
}
