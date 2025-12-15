/**
 * Data Processing Service for CAP Alert Data
 * Handles CSV parsing, CAP XML processing, and data normalization
 */

import Papa from "papaparse";

// Alert data structure interfaces (for documentation)
export const AlertCategory = {
  MET: "Met",
  GEO: "Geo",
  SAFETY: "Safety",
  SECURITY: "Security",
  RESCUE: "Rescue",
  FIRE: "Fire",
  HEALTH: "Health",
  ENV: "Env",
  TRANSPORT: "Transport",
  INFRA: "Infra",
  CBRNE: "CBRNE",
  OTHER: "Other",
};

export const AlertUrgency = {
  IMMEDIATE: "Immediate",
  EXPECTED: "Expected",
  FUTURE: "Future",
  PAST: "Past",
  UNKNOWN: "Unknown",
};

export const AlertSeverity = {
  EXTREME: "Extreme",
  SEVERE: "Severe",
  MODERATE: "Moderate",
  MINOR: "Minor",
  UNKNOWN: "Unknown",
};

export const AlertCertainty = {
  OBSERVED: "Observed",
  LIKELY: "Likely",
  POSSIBLE: "Possible",
  UNLIKELY: "Unlikely",
  UNKNOWN: "Unknown",
};

export const AlertStatus = {
  ACTUAL: "Actual",
  EXERCISE: "Exercise",
  SYSTEM: "System",
  TEST: "Test",
  DRAFT: "Draft",
};

export const MessageType = {
  ALERT: "Alert",
  UPDATE: "Update",
  CANCEL: "Cancel",
  ACK: "Ack",
  ERROR: "Error",
};

/**
 * Main DataProcessor class for handling CAP alert data
 */
export class DataProcessor {
  /**
   * Load and process CSV file containing CAP alert data
   * @param {string} csvPath - Path to the CSV file
   * @returns {Promise<Array>} Array of normalized alert objects
   */
  static async loadAndProcessCSV(csvPath) {
    try {
      console.log("Loading CSV data from:", csvPath);

      // Fetch the CSV file
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch CSV: ${response.status} ${response.statusText}`,
        );
      }

      const csvText = await response.text();
      console.log("CSV loaded, size:", csvText.length, "characters");

      // Parse CSV data
      const csvData = this.parseCSV(csvText);
      console.log("CSV parsed, found", csvData.length, "rows");

      // Process each row and extract CAP data
      const alerts = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        try {
          const row = csvData[i];
          if (row.content && row.content.trim()) {
            const alert = this.processCapRow(row, i);
            if (alert) {
              alerts.push(alert);
            }
          }
        } catch (error) {
          console.warn(`Error processing row ${i}:`, error.message);
          errors.push({ row: i, error: error.message });
        }
      }

      console.log(
        `Processing complete: ${alerts.length} alerts processed, ${errors.length} errors`,
      );

      if (errors.length > 0) {
        console.warn("Processing errors:", errors);
      }

      return alerts;
    } catch (error) {
      console.error("Failed to load and process CSV:", error);
      throw new Error(`Data processing failed: ${error.message}`);
    }
  } /**

   * Parse CSV text into array of objects
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Array of row objects
   */
  static parseCSV(csvText) {
    try {
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        newline: "\n",
        transformHeader: (header) => header.trim(),
        transform: (value) => {
          // Clean up the value by removing extra whitespace
          return typeof value === "string" ? value.trim() : value;
        },
      });

      if (result.errors && result.errors.length > 0) {
        console.warn("CSV parsing warnings:", result.errors);
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("No data found in CSV file");
      }

      console.log(`CSV parsed successfully: ${result.data.length} rows`);
      return result.data;
    } catch (error) {
      console.error("CSV parsing failed:", error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  }

  /**
   * Process a single CSV row containing CAP data
   * @param {Object} row - CSV row object
   * @param {number} index - Row index for error reporting
   * @returns {Object|null} Normalized alert object or null if invalid
   */
  static processCapRow(row, index) {
    try {
      // Extract CAP XML from content field
      const capXml = row.content;
      if (!capXml || !capXml.includes("<alert")) {
        console.warn(`Row ${index}: No valid CAP XML found`);
        return null;
      }

      // Parse CAP XML
      const capData = this.parseCapXml(capXml);
      if (!capData) {
        console.warn(`Row ${index}: Failed to parse CAP XML`);
        return null;
      }

      // Create normalized alert object
      const alert = this.normalizeAlertData(capData, row, index);

      return alert;
    } catch (error) {
      console.warn(`Row ${index}: Error processing CAP data:`, error.message);
      return null;
    }
  } /**
   *
Parse CAP XML using DOMParser
   * @param {string} xmlString - CAP XML string
   * @returns {Object|null} Parsed CAP data object or null if invalid
   */
  static parseCapXml(xmlString) {
    try {
      // Check if DOMParser is available (browser environment)
      if (typeof DOMParser === "undefined") {
        console.warn(
          "DOMParser not available - this method requires a browser environment",
        );
        return null;
      }

      // Clean up the XML string - handle double quotes in attributes
      const cleanXml = xmlString.replace(/""([^"]*)""/g, '"$1"');

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(cleanXml, "text/xml");

      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error(`XML parsing error: ${parserError.textContent}`);
      }

      const alert = xmlDoc.querySelector("alert");
      if (!alert) {
        throw new Error("No alert element found in XML");
      }

      // Extract basic alert information
      const capData = {
        identifier: this.getElementText(alert, "identifier"),
        sender: this.getElementText(alert, "sender"),
        source: this.getElementText(alert, "source"), // Add this line
        sent: this.getElementText(alert, "sent"),
        status: this.getElementText(alert, "status"),
        msgType: this.getElementText(alert, "msgType"),
        scope: this.getElementText(alert, "scope"),
        references: this.getElementText(alert, "references"),
        info: null,
      };

      // Extract info element data
      const info = alert.querySelector("info");
      if (info) {
        capData.info = {
          language: this.getElementText(info, "language"),
          category: this.getElementText(info, "category"),
          event: this.getElementText(info, "event"),
          urgency: this.getElementText(info, "urgency"),
          severity: this.getElementText(info, "severity"),
          certainty: this.getElementText(info, "certainty"),
          effective: this.getElementText(info, "effective"),
          expires: this.getElementText(info, "expires"),
          senderName: this.getElementText(info, "senderName"),
          headline: this.getElementText(info, "headline"),
          description: this.getElementText(info, "description"),
          area: null,
        };

        // Extract area information
        const area = info.querySelector("area");
        if (area) {
          capData.info.area = {
            areaDesc: this.getElementText(area, "areaDesc"),
            polygon: this.getElementText(area, "polygon"),
          };
        }
      }

      return capData;
    } catch (error) {
      console.warn("CAP XML parsing error:", error.message);
      return null;
    }
  }

  /**
   * Helper method to safely extract text content from XML elements
   * @param {Element} parent - Parent XML element
   * @param {string} tagName - Tag name to search for
   * @returns {string} Text content or empty string if not found
   */
  static getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent.trim() : "";
  } /**

   * Extract and validate polygon coordinates from CAP XML
   * @param {string} polygonString - Polygon coordinate string from CAP
   * @returns {Array|null} Array of [lat, lng] coordinate pairs or null if invalid
   */
  static extractPolygonCoordinates(polygonString) {
    if (!polygonString || typeof polygonString !== "string") {
      return null;
    }

    try {
      // CAP polygon format: "lat1,lng1 lat2,lng2 lat3,lng3 ..."
      const coordinatePairs = polygonString.trim().split(/\s+/);
      const coordinates = [];

      for (const pair of coordinatePairs) {
        const [latStr, lngStr] = pair.split(",");

        if (!latStr || !lngStr) {
          console.warn("Invalid coordinate pair:", pair);
          continue;
        }

        const lat = parseFloat(latStr.trim());
        const lng = parseFloat(lngStr.trim());

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.warn("Non-numeric coordinates:", pair);
          continue;
        }

        // Basic bounds check for New Zealand region (-50 to -30 lat, 160 to 180 lng)
        if (lat < -50 || lat > -30 || lng < 160 || lng > 180) {
          console.warn("Coordinates outside New Zealand bounds:", pair);
          // Don't skip - might be valid for other regions
        }

        coordinates.push([lat, lng]);
      }

      // Need at least 3 points for a valid polygon
      if (coordinates.length < 3) {
        console.warn(
          "Insufficient coordinates for polygon:",
          coordinates.length,
        );
        return null;
      }

      // Ensure polygon is closed (first and last points should be the same)
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordinates.push([first[0], first[1]]);
      }

      return coordinates;
    } catch (error) {
      console.warn("Error extracting polygon coordinates:", error.message);
      return null;
    }
  }

  /**
   * Validate and normalize alert data values
   * @param {string} value - Raw value to validate
   * @param {Object} enumObject - Enum object with valid values
   * @param {string} defaultValue - Default value if validation fails
   * @returns {string} Validated and normalized value
   */
  static validateEnumValue(value, enumObject, defaultValue = "Unknown") {
    if (!value || typeof value !== "string") {
      return defaultValue;
    }

    const normalizedValue = value.trim();

    // Check if value exists in enum (case-insensitive)
    const enumValues = Object.values(enumObject);
    const matchedValue = enumValues.find(
      (enumVal) => enumVal.toLowerCase() === normalizedValue.toLowerCase(),
    );

    return matchedValue || defaultValue;
  }

  /**
   * Safely parse date string
   * @param {string} dateString - Date string to parse
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDate(dateString) {
    if (!dateString || typeof dateString !== "string") {
      return null;
    }

    try {
      const date = new Date(dateString.trim());
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn("Error parsing date:", dateString, error.message);
      return null;
    }
  } /**

   * Create normalized Alert data structure
   * @param {Object} capData - Parsed CAP XML data
   * @param {Object} csvRow - Original CSV row data
   * @param {number} index - Row index for ID generation
   * @returns {Object} Normalized alert object
   */
  static normalizeAlertData(capData, csvRow, index) {
    try {
      // Generate unique ID
      const id = capData.identifier || `alert-${index}`;

      // Extract polygon coordinates
      const polygonString = capData.info?.area?.polygon || "";
      const polygon = this.extractPolygonCoordinates(polygonString);

      // Create normalized alert object
      const alert = {
        // Basic identification
        id: id,
        identifier: capData.identifier || "", // Add this line
        title: capData.info?.headline || csvRow.title || "Untitled Alert",
        description: capData.info?.description || csvRow.summary || "",

        // Alert classification
        category: this.validateEnumValue(
          capData.info?.category,
          AlertCategory,
          AlertCategory.OTHER,
        ),
        event: capData.info?.event || "Unknown Event",
        urgency: this.validateEnumValue(
          capData.info?.urgency,
          AlertUrgency,
          AlertUrgency.UNKNOWN,
        ),
        severity: this.validateEnumValue(
          capData.info?.severity,
          AlertSeverity,
          AlertSeverity.UNKNOWN,
        ),
        certainty: this.validateEnumValue(
          capData.info?.certainty,
          AlertCertainty,
          AlertCertainty.UNKNOWN,
        ),
        status: this.validateEnumValue(
          capData.status,
          AlertStatus,
          AlertStatus.ACTUAL,
        ),
        msgType: this.validateEnumValue(
          capData.msgType,
          MessageType,
          MessageType.ALERT,
        ),

        // Sender information
        sender: capData.sender || "Unknown Sender",
        senderName: capData.info?.senderName || csvRow.author || "Unknown",
        source: capData.source || "", // Add this line

        // Temporal information
        sent:
          this.parseDate(capData.sent) ||
          this.parseDate(csvRow.pubDate) ||
          new Date(),
        effective: this.parseDate(capData.info?.effective),
        expires: this.parseDate(capData.info?.expires),

        // Geographic information
        areaDesc: capData.info?.area?.areaDesc || "Unknown Area",
        polygon: polygon,

        // Additional metadata
        originalXml: csvRow.content || "",
        language: capData.info?.language || "en-US",
        references: capData.references || "",

        // Computed fields for UI
        hasGeometry: polygon !== null && polygon.length > 0,
        isExpired: capData.info?.expires
          ? new Date(capData.info.expires) < new Date()
          : false,
        isCancelled: capData.msgType === MessageType.CANCEL,
      };

      // Validate required fields
      if (!alert.title.trim()) {
        alert.title = `Alert ${id}`;
      }

      if (!alert.description.trim()) {
        alert.description = "No description available";
      }

      return alert;
    } catch (error) {
      console.error("Error normalizing alert data:", error);
      throw new Error(`Failed to normalize alert data: ${error.message}`);
    }
  }

  /**
   * Validate a complete alert object
   * @param {Object} alert - Alert object to validate
   * @returns {boolean} True if alert is valid
   */
  static validateAlert(alert) {
    if (!alert || typeof alert !== "object") {
      return false;
    }

    // Check required fields
    const requiredFields = [
      "id",
      "title",
      "category",
      "severity",
      "urgency",
      "sent",
    ];
    for (const field of requiredFields) {
      if (!alert[field]) {
        console.warn(`Alert validation failed: missing ${field}`);
        return false;
      }
    }

    // Validate dates
    if (!(alert.sent instanceof Date) || isNaN(alert.sent.getTime())) {
      console.warn("Alert validation failed: invalid sent date");
      return false;
    }

    return true;
  }

  /**
   * Parse CAP references string
   * @param {string} referencesStr - References string (space-separated triplets)
   * @returns {Array} Array of reference objects {sender, identifier, sent}
   */
  static parseReferences(referencesStr) {
    if (!referencesStr || typeof referencesStr !== "string") return [];

    // Split by whitespace to get triplets
    const triplets = referencesStr.trim().split(/\s+/);
    const refs = [];

    for (const triplet of triplets) {
      // Format: sender,identifier,sent
      const parts = triplet.split(",");
      if (parts.length >= 2) {
        refs.push({
          sender: parts[0],
          identifier: parts[1],
          sent: parts.slice(2).join(","),
        });
      }
    }
    return refs;
  }

  /**
   * Group alerts based on references
   * Uses Union-Find to identify connected components of alerts
   * @param {Array} alerts - Flat array of alert objects
   * @returns {Array} Array of grouped alert objects (latest version with timeline)
   */
  static groupAlerts(alerts) {
    if (!alerts || alerts.length === 0) return [];

    const alertMap = new Map(alerts.map((a) => [a.id, a]));
    const parentMap = new Map(); // For Union-Find: child -> parent

    // Initialize Union-Find
    for (const alert of alerts) {
      parentMap.set(alert.id, alert.id);
    }

    function find(id) {
      if (parentMap.get(id) === id) return id;
      const root = find(parentMap.get(id));
      parentMap.set(id, root); // Path compression
      return root;
    }

    function union(id1, id2) {
      const root1 = find(id1);
      const root2 = find(id2);
      if (root1 !== root2) {
        parentMap.set(root1, root2);
      }
    }

    // Process references
    for (const alert of alerts) {
      if (alert.references) {
        const refs = this.parseReferences(alert.references);
        for (const ref of refs) {
          if (alertMap.has(ref.identifier)) {
            union(alert.id, ref.identifier);
          }
        }
      }
    }

    // Group alerts
    const groups = new Map();
    for (const alert of alerts) {
      const rootId = find(alert.id);
      if (!groups.has(rootId)) {
        groups.set(rootId, []);
      }
      groups.get(rootId).push(alert);
    }

    // Process groups into displayable alert objects
    const result = [];
    for (const groupAlerts of groups.values()) {
      // Sort by date (sent)
      groupAlerts.sort((a, b) => a.sent.getTime() - b.sent.getTime());

      // The main alert is the latest one
      const latestAlert = groupAlerts[groupAlerts.length - 1];

      // Inherit geometry from previous alerts if missing (e.g., for cancellations)
      let polygon = latestAlert.polygon;
      let hasGeometry = latestAlert.hasGeometry;

      if (!hasGeometry) {
        // Look back in history for geometry
        for (let i = groupAlerts.length - 2; i >= 0; i--) {
          if (groupAlerts[i].hasGeometry) {
            polygon = groupAlerts[i].polygon;
            hasGeometry = true;
            break;
          }
        }
      }

      // Add timeline info
      const combinedAlert = {
        ...latestAlert,
        polygon,
        hasGeometry,
        timeline: groupAlerts,
        isGroupHeader: true,
        groupSize: groupAlerts.length,
      };

      result.push(combinedAlert);
    }

    return result;
  }
}

// Export default instance for convenience
export default DataProcessor;
