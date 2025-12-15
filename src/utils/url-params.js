/**
 * URL Query Parameter Utilities
 * Handles serialization and deserialization of filters and alert state to/from URL query parameters
 */

import { createEmptyFilters } from "./alert-filters.js";

/**
 * Serialize filters object to URL query parameters
 * @param {Object} filters - Filter state object
 * @returns {URLSearchParams} URLSearchParams object with filter parameters
 */
export function serializeFiltersToURL(filters) {
  const params = new URLSearchParams();

  // Date range
  if (filters.dateRange?.start) {
    params.set(
      "dateStart",
      filters.dateRange.start.toISOString().split("T")[0],
    );
  }
  if (filters.dateRange?.end) {
    params.set("dateEnd", filters.dateRange.end.toISOString().split("T")[0]);
  }

  // Array filters (categories, severities, urgencies, statuses, messageTypes)
  const arrayFilters = [
    "categories",
    "severities",
    "urgencies",
    "statuses",
    "messageTypes",
  ];

  arrayFilters.forEach((filterKey) => {
    if (filters[filterKey]?.length > 0) {
      params.set(filterKey, filters[filterKey].join(","));
    }
  });

  // Search text
  if (filters.searchText?.trim()) {
    params.set("search", filters.searchText.trim());
  }

  return params;
}

/**
 * Deserialize URL query parameters to filters object
 * @param {URLSearchParams} params - URLSearchParams object
 * @returns {Object} Filter state object
 */
export function deserializeFiltersFromURL(params) {
  const filters = createEmptyFilters();

  // Date range
  const dateStart = params.get("dateStart");
  const dateEnd = params.get("dateEnd");

  if (dateStart) {
    // Set to noon to avoid timezone shift issues on day boundaries
    filters.dateRange.start = new Date(dateStart + "T12:00:00");
  }
  if (dateEnd) {
    filters.dateRange.end = new Date(dateEnd + "T12:00:00");
  }

  // Array filters
  const arrayFilters = [
    "categories",
    "severities",
    "urgencies",
    "statuses",
    "messageTypes",
  ];

  arrayFilters.forEach((filterKey) => {
    const value = params.get(filterKey);
    if (value) {
      filters[filterKey] = value.split(",").filter(Boolean);
    }
  });

  // Search text
  const search = params.get("search");
  if (search) {
    filters.searchText = search;
  }

  return filters;
}

/**
 * Get alert ID from URL query parameters
 * @param {URLSearchParams} params - URLSearchParams object
 * @returns {string|null} Alert ID or null
 */
export function getAlertIdFromURL(params) {
  return params.get("alert") || null;
}

/**
 * Update URL query parameters without page reload
 * @param {Object} options - Options object
 * @param {Object} options.filters - Filter state object
 * @param {string|null} options.alertId - Alert ID to show in dialog
 * @param {boolean} options.replace - Whether to replace current history entry (default: true)
 */
export function updateURLParams({ filters, alertId, replace = true }) {
  if (typeof window === "undefined") return;

  const params = serializeFiltersToURL(filters);

  // Add alert ID if provided
  if (alertId) {
    params.set("alert", alertId);
  } else {
    // Remove alert param if not provided
    params.delete("alert");
  }

  // Build new URL
  const newURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;

  // Update URL without reload
  if (replace) {
    window.history.replaceState({}, "", newURL);
  } else {
    window.history.pushState({}, "", newURL);
  }
}

/**
 * Read current URL query parameters
 * @returns {Object} Object with filters and alertId
 */
export function readURLParams() {
  if (typeof window === "undefined") {
    return { filters: createEmptyFilters(), alertId: null };
  }

  const params = new URLSearchParams(window.location.search);
  const filters = deserializeFiltersFromURL(params);
  const alertId = getAlertIdFromURL(params);

  return { filters, alertId };
}

export default {
  serializeFiltersToURL,
  deserializeFiltersFromURL,
  getAlertIdFromURL,
  updateURLParams,
  readURLParams,
};
