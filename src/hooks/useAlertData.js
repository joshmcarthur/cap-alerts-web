/**
 * useAlertData Hook
 * Custom React hook for loading and managing alert data
 */

import { useState, useEffect, useCallback } from "react";
import { DataProcessor } from "../services/data-processor.js";

/**
 * Custom hook for alert data loading and management
 * @param {string} csvPath - Path to the CSV file containing alert data
 * @returns {Object} Hook state and methods
 */
export function useAlertData(csvPath) {
  // State management
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      console.log("Starting alert data loading...");

      // Simulate progress updates during loading
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Load and process the CSV data
      const alertData = await DataProcessor.loadAndProcessCSV(csvPath);

      // Clear progress interval
      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log(`Successfully loaded ${alertData.length} alerts`);

      // Validate the loaded data
      const validAlerts = alertData.filter((alert) => {
        const isValid = DataProcessor.validateAlert(alert);
        if (!isValid) {
          console.warn("Invalid alert filtered out:", alert.id);
        }
        return isValid;
      });

      console.log(`${validAlerts.length} valid alerts after filtering`);

      // Group alerts together
      const groupedAlerts = DataProcessor.groupAlerts(validAlerts);
      console.log(
        `Grouped ${validAlerts.length} alerts into ${groupedAlerts.length} groups`,
      );

      setAlerts(groupedAlerts);
      setLoading(false);
    } catch (err) {
      console.error("Error loading alert data:", err);
      setError(err.message || "Failed to load alert data");
      setLoading(false);
      setLoadingProgress(0);
    }
  }, [csvPath]);

  // Retry loading function
  const retryLoading = useCallback(() => {
    console.log("Retrying alert data loading...");
    loadData();
  }, [loadData]);

  // Load data on mount and when csvPath changes
  useEffect(() => {
    if (csvPath) {
      loadData();
    }
  }, [csvPath, loadData]);

  // Computed values
  const alertStats = alerts
    ? {
        total: alerts.length,
        categories: [...new Set(alerts.map((alert) => alert.category))].sort(),
        severities: [...new Set(alerts.map((alert) => alert.severity))].sort(),
        urgencies: [...new Set(alerts.map((alert) => alert.urgency))].sort(),
        statuses: [...new Set(alerts.map((alert) => alert.status))].sort(),
        messageTypes: [...new Set(alerts.map((alert) => alert.msgType))].sort(),
        dateRange:
          alerts.length > 0
            ? {
                earliest: new Date(
                  Math.min(...alerts.map((alert) => alert.sent.getTime())),
                ),
                latest: new Date(
                  Math.max(...alerts.map((alert) => alert.sent.getTime())),
                ),
              }
            : null,
        withGeometry: alerts.filter((alert) => alert.hasGeometry).length,
        expired: alerts.filter((alert) => alert.isExpired).length,
        cancelled: alerts.filter((alert) => alert.isCancelled).length,
      }
    : null;

  // Helper functions for data access
  const getAlertById = useCallback(
    (id) => {
      return alerts?.find((alert) => alert.id === id) || null;
    },
    [alerts],
  );

  const getAlertsByCategory = useCallback(
    (category) => {
      return alerts?.filter((alert) => alert.category === category) || [];
    },
    [alerts],
  );

  const getAlertsBySeverity = useCallback(
    (severity) => {
      return alerts?.filter((alert) => alert.severity === severity) || [];
    },
    [alerts],
  );

  const getAlertsInDateRange = useCallback(
    (startDate, endDate) => {
      if (!alerts) return [];

      return alerts.filter((alert) => {
        const alertDate = alert.sent;
        if (startDate && alertDate < startDate) return false;
        if (endDate && alertDate > endDate) return false;
        return true;
      });
    },
    [alerts],
  );

  const searchAlerts = useCallback(
    (searchTerm) => {
      if (!alerts || !searchTerm.trim()) return alerts || [];

      const term = searchTerm.toLowerCase().trim();
      return alerts.filter(
        (alert) =>
          alert.title.toLowerCase().includes(term) ||
          alert.description.toLowerCase().includes(term) ||
          alert.event.toLowerCase().includes(term) ||
          alert.areaDesc.toLowerCase().includes(term) ||
          alert.senderName.toLowerCase().includes(term),
      );
    },
    [alerts],
  );

  // Return hook interface
  return {
    // Core state
    alerts,
    loading,
    error,
    loadingProgress,

    // Statistics and metadata
    alertStats,

    // Actions
    retryLoading,
    loadData,

    // Helper functions
    getAlertById,
    getAlertsByCategory,
    getAlertsBySeverity,
    getAlertsInDateRange,
    searchAlerts,

    // Computed flags
    hasData: alerts !== null && alerts.length > 0,
    isEmpty: alerts !== null && alerts.length === 0,
    isInitialLoad: loading && alerts === null,
  };
}

// Export default for convenience
export default useAlertData;
