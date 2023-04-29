import { useState, useEffect, useRef } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import { buffer, bbox, bboxPolygon, point, Point } from "@turf/turf";
import { getTravelTime } from "@/queries/getTravelTime";
import "./map.css";
import "mapbox-gl/dist/mapbox-gl.css";

// Get your Mapbox access token from the environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface MapProps {
  onMapClick: (coordinates: LngLatLike, map: mapboxgl.Map) => void;
  greenLimit: number;
  polyline: any;
  hoveredLegId: number | null;
}

interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
}

const Map: React.FC<MapProps> = ({
  onMapClick,
  greenLimit,
  polyline,
  hoveredLegId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  // Update the useEffect to handle an array of polyline data
  useEffect(() => {
    if (map && polyline) {
      const source = map.getSource("polyline") as mapboxgl.GeoJSONSource;
      const convertedPolylines = convertPolylines(polyline, hoveredLegId);
      const geoJSONData = {
        type: "FeatureCollection",
        features: convertedPolylines.map(({ coordinates, isHovered }) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
          properties: {
            isHovered,
          },
        })),
      };
      if (source) {
        source.setData(geoJSONData);
      }

      // Handle the circle features
      const circleSource = map.getSource("circle") as mapboxgl.GeoJSONSource;
      const circleGeoJSONData = {
        type: "FeatureCollection",
        features: getCircleFeatures(convertedPolylines),
      };
      if (circleSource) {
        circleSource.setData(circleGeoJSONData);
      }
    } else if (map && polyline === null) {
      const source = map.getSource("polyline") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }

      // Remove circle features
      const circleSource = map.getSource("circle") as mapboxgl.GeoJSONSource;
      if (circleSource) {
        circleSource.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    }
  }, [map, polyline, hoveredLegId]);

  useEffect(() => {
    async function initializeMap() {
      // Load travel time data
      const travelTimeData: ILocation[] = await getTravelTime();
      console.log("travelTimeData: ", travelTimeData);

      // Create a new Mapbox GL JS map
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/axeln/clgp2ccxh00gs01pc0iat3y1d",
        center: [18.0686, 59.3293],
        zoom: 11,
      });

      mapInstance.on("load", () => {
        // Define grid bounds
        const gridBounds = bbox(
          buffer(point([18.0686, 59.3293]), 190, { units: "meters" })
        ) as [number, number, number, number];

        // Add a GeoJSON source for the polyline
        mapInstance.addSource("polyline", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Add the polyline layer
        mapInstance.addLayer({
          id: "polyline",
          type: "line",
          source: "polyline",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["get", "isHovered"], false],
              "#ffffff", // White color for the hovered polyline
              "#ff0000", // Default color for other polylines
            ],
            "line-width": 5,
          },
        });

        // Polyline circle, travel path
        mapInstance.addSource("circle", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Polyline circle, travel path
        // Add the circle layer for the start and end of each polyline
        mapInstance.addLayer({
          id: "circle",
          type: "circle",
          source: "circle",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "case",
              ["boolean", ["get", "isHovered"], false],
              "#ffffff", // Color for hovered circles
              "#ff0000", // Default color for circles
            ],
          },
        });

        // Add a GeoJSON source for the travel time data
        mapInstance.addSource("travelTimeData", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: travelTimeData.map((location: ILocation) => {
              const center = point([location.lng, location.lat]);
              const buffered = buffer(center, 190, { units: "meters" });
              const squarePolygon = bboxPolygon(bbox(buffered));

              return {
                type: "Feature",
                geometry: squarePolygon.geometry,
                properties: {
                  fastestTime: location.fastestTime,
                },
              };
            }),
          },
        });

        // Find the water layer in the map style
        let waterLayerId: string | undefined;
        const layers2 = mapInstance.getStyle().layers;
        if (layers2) {
          for (let i = 0; i < layers2.length; i++) {
            if (layers2[i].id.includes("water")) {
              waterLayerId = layers2[i].id;
              break;
            }
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
                colors[0], // Green
                limits[0], // End of green
                colors[1], // Start of yellow
                limits[1], // Start fading yellow
                colors[2], // Start of orange
                limits[2], // Start fading orange
                colors[3], // Red
              ],
              "fill-opacity": 1,
            },
          },
          waterLayerId // Add the travel time layer before the first symbol layer
        );
      });

      mapInstance.on("click", (e) => {
        const coordinates: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

        // Remove the previous marker if it exists
        if (mapInstance.hasOwnProperty("currentMarker")) {
          (mapInstance as any).currentMarker.remove();
        }

        // Create a new marker and add it to the map
        const newMarker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(mapInstance);

        // Store the new marker directly on the map instance
        (mapInstance as any).currentMarker = newMarker;

        onMapClick(coordinates, mapInstance);

        // Logging positon time for testing

        // Query the travel time data at the clicked position
        const featuresAtPosition = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["travelTimeGrid"],
        });

        // If there's a feature at the clicked position, log its travel time data
        if (featuresAtPosition.length > 0) {
          const travelTimeData = featuresAtPosition[0].properties.fastestTime;
          console.log("Travel time data at clicked position:", travelTimeData);
        }
      });

      setMap(mapInstance);
    }

    if (!map) {
      initializeMap();
    }
  }, [map, onMapClick]);

  const limits = [greenLimit, 15 + greenLimit, 45 + greenLimit];
  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  // Update heatmap layer's paint property when greenLimit changes
  useEffect(() => {
    console.log("greenLimit: ", greenLimit);
    if (map && map.getLayer("travelTimeGrid")) {
      map.setPaintProperty("travelTimeGrid", "fill-color", [
        "interpolate",
        ["linear"],
        ["get", "fastestTime"],
        0,
        colors[0], // Green
        limits[0], // Start fading green
        colors[1], // Start of yellow
        limits[1], // Start fading yellow
        colors[2], // Start of orange
        limits[2], // Start fading orange
        colors[3], // Red
      ]);
    }

    updateMap();
  }, [map, greenLimit]);

  const updateMap = () => {
    if (map) {
      map.resize();
    }
  };

  return (
    <div className="container">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
};

export default Map;

function convertPolylines(polyline, hoveredLegId: number | null) {
  const convertedPolylines = polyline.map((polyline, index) => {
    // Check if the current polyline is hovered
    const isHovered = index === hoveredLegId;

    if (polyline.length === 2 && Array.isArray(polyline[0])) {
      return { coordinates: polyline, isHovered };
    } else {
      const [startLongitude, startLatitude, ...differences] = polyline;
      const coordinates = [[startLongitude, startLatitude]];

      for (let i = 0; i < differences.length; i += 2) {
        const lastCoordinate = coordinates[coordinates.length - 1];
        const longitude = lastCoordinate[0] + differences[i];
        const latitude = lastCoordinate[1] + differences[i + 1];
        coordinates.push([longitude, latitude]);
      }

      return { coordinates, isHovered };
    }
  });

  return convertedPolylines;
}

function getCircleFeatures(convertedPolylines) {
  const circleFeatures = [];

  const combinedCircles = {};

  convertedPolylines.forEach(({ coordinates, isHovered }) => {
    const start = coordinates[0].toString();
    const end = coordinates[coordinates.length - 1].toString();

    if (combinedCircles.hasOwnProperty(start)) {
      combinedCircles[start] = combinedCircles[start] || isHovered;
    } else {
      combinedCircles[start] = isHovered;
    }

    if (combinedCircles.hasOwnProperty(end)) {
      combinedCircles[end] = combinedCircles[end] || isHovered;
    } else {
      combinedCircles[end] = isHovered;
    }
  });

  Object.entries(combinedCircles).forEach(([coordinates, isHovered]) => {
    circleFeatures.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coordinates.split(",").map(Number),
      },
      properties: {
        isHovered,
      },
    });
  });

  return circleFeatures;
}
