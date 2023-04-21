import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { getTravelTime } from "@/queries/getTravelTime";
import * as turf from "@turf/turf";
import "./map.css";
import { findClosestNode, buildTree } from "@/lib/KDtree";
import "mapbox-gl/dist/mapbox-gl.css";
import { buffer, squareGrid } from "@turf/turf";
import triangleGrid from "@turf/triangle-grid";
import rectangleGrid from "@turf/rectangle-grid";

// Get your Mapbox access token from the environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocationData, setClickedLocationData] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      // Load travel time data
      const travelTimeData = await getTravelTime();

      // Create a new Mapbox GL JS map
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [18.0686, 59.3293],
        zoom: 11,
      });

      mapInstance.on("load", () => {
        // Define grid bounds
        const bbox = [
          18.0015853636, // minLng
          59.2762895294, // minLat
          18.1357347274, // maxLng
          59.3822632836, // maxLat
        ];

        // Create a buffered square around each data point
        const bufferedData = travelTimeData.map((point) => {
          const bufferedPoint = buffer(
            turf.point([point.lng, point.lat]),
            0.1, // Buffer distance in kilometers, adjust this value as needed
            { units: "kilometers", steps: 4 }
          );
          return {
            type: "Feature",
            geometry: bufferedPoint.geometry,
            properties: {
              fastestTime: point.fastestTime,
            },
          };
        });

        // Add a GeoJSON source for the travel time data
        mapInstance.addSource("travelTimeData", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: travelTimeData.map((point) => {
              const center = turf.point([point.lng, point.lat]);
              const step = 0.003 / 2;
              /*
              const rectangle = turf.polygon([
                [
                  [point.lng - step, point.lat - step],
                  [point.lng - step, point.lng + step],
                  [point.lng + step, point.lng - step],
                  [point.lng + step, point.lng + step],
                  [point.lng - step, point.lat - step],
                ],
              ]);
              */
              const buffered = turf.buffer(center, 180, {
                units: "meters",
              });
              const bbox = turf.bbox(buffered);
              const squarePolygon = turf.bboxPolygon(bbox);

              return {
                type: "Feature",
                geometry: squarePolygon.geometry,
                properties: {
                  fastestTime: point.fastestTime,
                },
              };
            }),
          },
        });

        // Find the first symbol layer in the map style
        let firstSymbolId;
        const layers = mapInstance.getStyle().layers;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === "symbol") {
            firstSymbolId = layers[i].id;
            break;
          }
        }

        // Add a heatmap layer using the travel time data
        // Add a square grid layer using the travel time data
        mapInstance.addLayer(
          {
            id: "travelTimeGrid",
            type: "fill",
            source: "travelTimeData",
            paint: {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "fastestTime"],
                0,
                "#00FF00", // Green
                15,
                "#00FF00", // Green
                30,
                "#FFFF00", // Yellow
                45,
                "#FFA500", // Orange
                150,
                "#FF0000", // Red
              ],
              "fill-opacity": 0.5,
            },
          },
          firstSymbolId // Add the travel time layer before the first symbol layer
        );

        // Add a vector source for admin-1 boundaries
        mapInstance.addSource("admin-1", {
          type: "vector",
          url: "mapbox://mapbox.boundaries-adm1-v4",
          promoteId: "mapbox_id",
        });

        // Define a filter for US worldview boundaries
        let worldviewFilter = [
          "any",
          ["==", "all", ["get", "worldview"]],
          ["in", "US", ["get", "worldview"]],
        ];

        // Add a style layer with the admin-1 source below map labels
        mapInstance.addLayer(
          {
            id: "admin-1-fill",
            type: "fill",
            source: "admin-1",
            "source-layer": "boundaries_admin_1",
            filter: worldviewFilter,
            paint: {
              "fill-color": "#CCCCCC",
              "fill-opacity": 0.5,
            },
          },
          // This final argument indicates that we want to add the Boundaries layer
          // before the `waterway-label` layer that is in the map from the Mapbox
          // Light style. This ensures the admin polygons are rendered below any labels
          "waterway-label"
        );
      });

      mapInstance.on("click", (e) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];

        // Remove the previous marker if it exists
        if (marker) {
          marker.remove();
        }

        // Create a new marker and add it to the map
        const newMarker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(mapInstance);

        // Set the marker state
        setMarker(newMarker);

        // Log the clicked location's information
        console.log("Clicked location:", e.lngLat);
      });

      setMap(mapInstance);
    };

    if (!map) {
      initializeMap();
    }
  }, [map]);

  return (
    <div className="container">
      <div ref={mapContainer} className="map-container" />
      {clickedLocationData && (
        <div className="location-info">
          <p>Latitude: {clickedLocationData.lat.toFixed(6)}</p>
          <p>Longitude: {clickedLocationData.lng.toFixed(6)}</p>
          <p>Fastest travel time: {clickedLocationData.fastestTime} minutes</p>
        </div>
      )}
    </div>
  );
}

export default Map;
