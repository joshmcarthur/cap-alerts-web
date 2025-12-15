import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useMemo,
  useRef,
} from "react";
import { AlertTriangle } from "lucide-react";
import { useAlertData } from "../../hooks/useAlertData.js";
import {
  applyFilters,
  createEmptyFilters,
  getFilterOptions,
} from "../../utils/alert-filters.js";
import { readURLParams, updateURLParams } from "../../utils/url-params.js";
import AppLayout from "./AppLayout.jsx";
const MapLibreViewer = lazy(() => import("./MapLibreViewer.jsx"));
import AlertListPanel from "./AlertListPanel.jsx";
import AlertDetailsModal from "./AlertDetailsModal.jsx";
import FilterPanel from "./FilterPanel.jsx";
import DisclaimerModal from "./DisclaimerModal.jsx";

export default function AlertMapApp() {
  // Data loading
  const { alerts, loading, error, retryLoading, getAlertById } =
    useAlertData("/data/cap.csv");

  // State
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState(createEmptyFilters());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Track if we've initialized from URL to prevent loops
  const hasInitializedFromURL = useRef(false);
  const isUpdatingURL = useRef(false);

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

  // Initialize from URL query parameters on mount (after alerts are loaded)
  useEffect(() => {
    if (!alerts || alerts.length === 0 || hasInitializedFromURL.current) {
      return;
    }

    const { filters: urlFilters, alertId } = readURLParams();
    hasInitializedFromURL.current = true;

    // Apply filters from URL
    if (urlFilters) {
      isUpdatingURL.current = true;
      setFilters(urlFilters);
      // Also set search term if present
      if (urlFilters.searchText) {
        setSearchTerm(urlFilters.searchText);
      }
      isUpdatingURL.current = false;
    }

    // Select alert from URL if present
    if (alertId) {
      const alert = getAlertById(alertId);
      if (alert) {
        setSelectedAlert(alert);
      } else {
        // Alert not found, remove from URL
        isUpdatingURL.current = true;
        updateURLParams({
          filters: urlFilters || createEmptyFilters(),
          alertId: null,
        });
        isUpdatingURL.current = false;
      }
    }
  }, [alerts, getAlertById]);

  // Update URL when filters or selectedAlert changes (but not during initialization)
  useEffect(() => {
    if (!hasInitializedFromURL.current || isUpdatingURL.current) {
      return;
    }

    updateURLParams({
      filters: {
        ...filters,
        searchText: searchTerm,
      },
      alertId: selectedAlert?.id || null,
    });
  }, [filters, searchTerm, selectedAlert]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined" || !hasInitializedFromURL.current) {
      return;
    }

    const handlePopState = () => {
      const { filters: urlFilters, alertId } = readURLParams();

      isUpdatingURL.current = true;

      // Update filters
      if (urlFilters) {
        setFilters(urlFilters);
        if (urlFilters.searchText) {
          setSearchTerm(urlFilters.searchText);
        } else {
          setSearchTerm("");
        }
      }

      // Update selected alert
      if (alertId) {
        const alert = getAlertById(alertId);
        if (alert) {
          setSelectedAlert(alert);
        } else {
          // Alert not found, clear selection and remove from URL
          setSelectedAlert(null);
          updateURLParams({
            filters: urlFilters || createEmptyFilters(),
            alertId: null,
          });
        }
      } else {
        setSelectedAlert(null);
      }

      isUpdatingURL.current = false;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getAlertById]);

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
    // URL will be updated automatically by the useEffect above
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
        <Suspense fallback={<div>Loading map...</div>}>
          <MapLibreViewer
            alerts={alerts}
            filteredAlerts={filteredAlerts}
            selectedAlert={selectedAlert}
            onAlertSelect={handleAlertSelect}
            isDarkMode={isDarkMode}
          />
        </Suspense>
      </AppLayout>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )}
    </>
  );
}
