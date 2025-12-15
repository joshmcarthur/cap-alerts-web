import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
  AttributionControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

const NZ_CENTER = {
  longitude: 174.7762,
  latitude: -41.2865,
  zoom: 5,
};

// Styles for the map
const MAP_STYLE_LIGHT =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAP_STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapLibreViewer({
  alerts = [],
  filteredAlerts = [],
  selectedAlert = null,
  onAlertSelect,
  isDarkMode = false,
}) {
  const mapRef = useRef(null);
  const [hoveredAlertId, setHoveredAlertId] = useState(null);

  // Calculate map bounds based on all alerts to restrict panning
  const mapBounds = useMemo(() => {
    if (!alerts || alerts.length === 0) return null;

    // Check if we have any valid geometries
    const hasGeometry = alerts.some(
      (a) => a.hasGeometry && a.polygon && a.polygon.length > 0,
    );
    if (!hasGeometry) return null;

    const bounds = new maplibregl.LngLatBounds();
    let validPoints = 0;

    alerts.forEach((alert) => {
      if (alert.hasGeometry && alert.polygon) {
        alert.polygon.forEach((coord) => {
          // alert.polygon is [lat, lng], extend takes [lng, lat]
          bounds.extend([coord[1], coord[0]]);
          validPoints++;
        });
      }
    });

    if (validPoints === 0) return null;

    // Add padding to bounds (approx 5 degrees buffer)
    const padding = 5.0;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    return [
      [sw.lng - padding, sw.lat - padding], // Southwest coordinates
      [ne.lng + padding, ne.lat + padding], // Northeast coordinates
    ];
  }, [alerts]);

  // Layer styles for polygons
  const fillLayer = useMemo(() => {
    const opacityExpression = selectedAlert
      ? [
          "case",
          ["==", ["get", "id"], selectedAlert.id],
          0.6, // Selected alert opacity
          0, // Other alerts opacity (hidden)
        ]
      : ["case", ["boolean", ["feature-state", "hover"], false], 0.6, 0.3]; // Default behavior when none selected

    return {
      id: "alert-fills",
      type: "fill",
      paint: {
        "fill-color": [
          "match",
          ["get", "severity"],
          "Extreme",
          "#ef4444", // red-500
          "Severe",
          "#f97316", // orange-500
          "Moderate",
          "#eab308", // yellow-500
          "Minor",
          "#3b82f6", // blue-500
          "#94a3b8", // slate-400 (default)
        ],
        "fill-opacity": opacityExpression,
        "fill-opacity-transition": {
          duration: 300,
          delay: 0,
        },
      },
    };
  }, [selectedAlert]);

  const lineLayer = useMemo(() => {
    const opacityExpression = selectedAlert
      ? [
          "case",
          ["==", ["get", "id"], selectedAlert.id],
          1, // Selected alert opacity
          0, // Other alerts opacity
        ]
      : 1; // Default opacity

    return {
      id: "alert-lines",
      type: "line",
      paint: {
        "line-color": [
          "match",
          ["get", "severity"],
          "Extreme",
          "#b91c1c", // red-700
          "Severe",
          "#c2410c", // orange-700
          "Moderate",
          "#a16207", // yellow-700
          "Minor",
          "#1d4ed8", // blue-700
          "#475569", // slate-600
        ],
        "line-width": 2,
        "line-opacity": opacityExpression,
        "line-opacity-transition": {
          duration: 300,
          delay: 0,
        },
      },
    };
  }, [selectedAlert]);

  // Convert alerts to GeoJSON
  const alertsGeoJSON = useMemo(() => {
    const features = filteredAlerts
      .filter(
        (alert) =>
          alert.hasGeometry && alert.polygon && alert.polygon.length > 0,
      )
      .map((alert) => {
        // Swap [lat, lng] to [lng, lat] for GeoJSON
        const coordinates = [
          alert.polygon.map((coord) => [coord[1], coord[0]]),
        ];

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: coordinates,
          },
          properties: {
            id: alert.id,
            title: alert.title,
            severity: alert.severity,
            category: alert.category,
            sent: alert.sent.toISOString(),
            description: alert.description,
            isCancelled: alert.isCancelled,
          },
        };
      });

    return {
      type: "FeatureCollection",
      features,
    };
  }, [filteredAlerts]);

  // Handle hover interactions
  const onHover = useCallback((event) => {
    const { features } = event;

    const hoveredFeature = features && features[0];

    setHoveredAlertId(hoveredFeature ? hoveredFeature.properties.id : null);
  }, []);

  // Handle click interactions
  const onClick = useCallback(
    (event) => {
      const feature = event.features && event.features[0];
      if (feature) {
        // Find the full alert object
        const alert = filteredAlerts.find(
          (a) => a.id === feature.properties.id,
        );
        if (alert) {
          onAlertSelect(alert);
        }
      } else {
        onAlertSelect(null);
      }
    },
    [filteredAlerts, onAlertSelect],
  );

  // Keep track of map view state before flying to an alert
  const prevViewState = useRef(null);

  // Fly to selected alert or restore view
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (selectedAlert && selectedAlert.hasGeometry) {
      // Save current view state if we haven't already
      if (!prevViewState.current) {
        prevViewState.current = {
          center: map.getCenter(),
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
        };
      }

      const coordinates = selectedAlert.polygon.map((coord) => [
        coord[1],
        coord[0],
      ]);
      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return bounds.extend(coord);
        },
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
      );

      map.fitBounds(bounds, {
        padding: 100,
        maxZoom: 12,
      });
    } else if (!selectedAlert && prevViewState.current) {
      // Restore previous view state
      map.flyTo({
        center: prevViewState.current.center,
        zoom: prevViewState.current.zoom,
        pitch: prevViewState.current.pitch,
        bearing: prevViewState.current.bearing,
      });
      prevViewState.current = null;
    }
  }, [selectedAlert]);

  return (
    <div className="w-full h-full relative group">
      <Map
        ref={mapRef}
        initialViewState={NZ_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle={isDarkMode ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
        interactiveLayerIds={["alert-fills"]}
        onMouseMove={onHover}
        onClick={onClick}
        attributionControl={false}
        maxBounds={mapBounds}
      >
        <Source id="alerts" type="geojson" data={alertsGeoJSON}>
          <Layer {...fillLayer} />
          <Layer {...lineLayer} />
        </Source>

        <NavigationControl position="bottom-right" />
        <ScaleControl position="bottom-left" />
        <AttributionControl
          position="bottom-right"
          customAttribution="CAP Data via NEMA, Metservice and others"
        />
      </Map>
    </div>
  );
}
