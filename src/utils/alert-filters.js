/**
 * Alert Filtering Utilities
 * Provides functions for filtering alert data based on various criteria
 */

/**
 * Apply all filters to an array of alerts
 * @param {Array} alerts - Array of alert objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered array of alerts
 */
export function applyFilters(alerts, filters) {
  if (!alerts || alerts.length === 0) {
    return [];
  }

  let filtered = [...alerts];

  // Apply date range filter
  if (filters.dateRange?.start || filters.dateRange?.end) {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  // Apply category filter
  if (filters.categories?.length > 0) {
    filtered = filterByCategories(filtered, filters.categories);
  }

  // Apply severity filter
  if (filters.severities?.length > 0) {
    filtered = filterBySeverities(filtered, filters.severities);
  }

  // Apply urgency filter
  if (filters.urgencies?.length > 0) {
    filtered = filterByUrgencies(filtered, filters.urgencies);
  }

  // Apply status filter
  if (filters.statuses?.length > 0) {
    filtered = filterByStatuses(filtered, filters.statuses);
  }

  // Apply message type filter
  if (filters.messageTypes?.length > 0) {
    filtered = filterByMessageTypes(filtered, filters.messageTypes);
  }

  // Apply search text filter
  if (filters.searchText?.trim()) {
    filtered = filterBySearchText(filtered, filters.searchText);
  }

  // Sort by date descending (newest first)
  filtered.sort((a, b) => b.sent.getTime() - a.sent.getTime());

  return filtered;
}

/**
 * Filter alerts by date range
 * @param {Array} alerts - Array of alert objects
 * @param {Object} dateRange - Date range object with start and end dates
 * @returns {Array} Filtered alerts
 */
export function filterByDateRange(alerts, dateRange) {
  if (!dateRange.start && !dateRange.end) {
    return alerts;
  }

  return alerts.filter((alert) => {
    const alertDate = alert.sent;

    if (dateRange.start && alertDate < dateRange.start) {
      return false;
    }

    if (dateRange.end && alertDate > dateRange.end) {
      return false;
    }

    return true;
  });
}

/**
 * Filter alerts by categories
 * @param {Array} alerts - Array of alert objects
 * @param {Array} categories - Array of category strings
 * @returns {Array} Filtered alerts
 */
export function filterByCategories(alerts, categories) {
  if (!categories || categories.length === 0) {
    return alerts;
  }

  return alerts.filter((alert) => categories.includes(alert.category));
}

/**
 * Filter alerts by severities
 * @param {Array} alerts - Array of alert objects
 * @param {Array} severities - Array of severity strings
 * @returns {Array} Filtered alerts
 */
export function filterBySeverities(alerts, severities) {
  if (!severities || severities.length === 0) {
    return alerts;
  }

  return alerts.filter((alert) => severities.includes(alert.severity));
}

/**
 * Filter alerts by urgencies
 * @param {Array} alerts - Array of alert objects
 * @param {Array} urgencies - Array of urgency strings
 * @returns {Array} Filtered alerts
 */
export function filterByUrgencies(alerts, urgencies) {
  if (!urgencies || urgencies.length === 0) {
    return alerts;
  }

  return alerts.filter((alert) => urgencies.includes(alert.urgency));
}

/**
 * Filter alerts by statuses
 * @param {Array} alerts - Array of alert objects
 * @param {Array} statuses - Array of status strings
 * @returns {Array} Filtered alerts
 */
export function filterByStatuses(alerts, statuses) {
  if (!statuses || statuses.length === 0) {
    return alerts;
  }

  return alerts.filter((alert) => statuses.includes(alert.status));
}

/**
 * Filter alerts by message types
 * @param {Array} alerts - Array of alert objects
 * @param {Array} messageTypes - Array of message type strings
 * @returns {Array} Filtered alerts
 */
export function filterByMessageTypes(alerts, messageTypes) {
  if (!messageTypes || messageTypes.length === 0) {
    return alerts;
  }

  return alerts.filter((alert) => messageTypes.includes(alert.msgType));
}

/**
 * Filter alerts by search text
 * @param {Array} alerts - Array of alert objects
 * @param {string} searchText - Search text string
 * @returns {Array} Filtered alerts
 */
export function filterBySearchText(alerts, searchText) {
  if (!searchText || !searchText.trim()) {
    return alerts;
  }

  const searchTerm = searchText.toLowerCase().trim();

  return alerts.filter((alert) => {
    // Search in multiple fields
    const searchableFields = [
      alert.title,
      alert.description,
      alert.event,
      alert.areaDesc,
      alert.senderName,
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(searchTerm),
    );
  });
}

/**
 * Get unique values for filter options from alerts array
 * @param {Array} alerts - Array of alert objects
 * @returns {Object} Object containing arrays of unique values for each filter type
 */
export function getFilterOptions(alerts) {
  if (!alerts || alerts.length === 0) {
    return {
      categories: [],
      severities: [],
      urgencies: [],
      statuses: [],
      messageTypes: [],
      dateRange: null,
    };
  }

  return {
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
  };
}

/**
 * Create an empty filter state object
 * @returns {Object} Empty filter state
 */
export function createEmptyFilters() {
  return {
    dateRange: { start: null, end: null },
    categories: [],
    severities: [],
    urgencies: [],
    statuses: [],
    messageTypes: [],
    searchText: "",
  };
}

/**
 * Check if any filters are active
 * @param {Object} filters - Filter state object
 * @returns {boolean} True if any filters are active
 */
export function hasActiveFilters(filters) {
  if (!filters) return false;

  return (
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    filters.categories?.length > 0 ||
    filters.severities?.length > 0 ||
    filters.urgencies?.length > 0 ||
    filters.statuses?.length > 0 ||
    filters.messageTypes?.length > 0 ||
    filters.searchText?.trim().length > 0
  );
}

/**
 * Get a summary of active filters for display
 * @param {Object} filters - Filter state object
 * @returns {Array} Array of active filter descriptions
 */
export function getActiveFilterSummary(filters) {
  const summary = [];

  if (filters.dateRange?.start || filters.dateRange?.end) {
    let dateDesc = "Date: ";
    if (filters.dateRange.start && filters.dateRange.end) {
      dateDesc += `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`;
    } else if (filters.dateRange.start) {
      dateDesc += `After ${filters.dateRange.start.toLocaleDateString()}`;
    } else {
      dateDesc += `Before ${filters.dateRange.end.toLocaleDateString()}`;
    }
    summary.push(dateDesc);
  }

  if (filters.categories?.length > 0) {
    summary.push(`Categories: ${filters.categories.join(", ")}`);
  }

  if (filters.severities?.length > 0) {
    summary.push(`Severities: ${filters.severities.join(", ")}`);
  }

  if (filters.urgencies?.length > 0) {
    summary.push(`Urgencies: ${filters.urgencies.join(", ")}`);
  }

  if (filters.statuses?.length > 0) {
    summary.push(`Statuses: ${filters.statuses.join(", ")}`);
  }

  if (filters.messageTypes?.length > 0) {
    summary.push(`Message Types: ${filters.messageTypes.join(", ")}`);
  }

  if (filters.searchText?.trim()) {
    summary.push(`Search: "${filters.searchText.trim()}"`);
  }

  return summary;
}

export default {
  applyFilters,
  filterByDateRange,
  filterByCategories,
  filterBySeverities,
  filterByUrgencies,
  filterByStatuses,
  filterByMessageTypes,
  filterBySearchText,
  getFilterOptions,
  createEmptyFilters,
  hasActiveFilters,
  getActiveFilterSummary,
};
