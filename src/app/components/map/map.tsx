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
}

interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
}

const Map: React.FC<MapProps> = ({ onMapClick, greenLimit, polyline }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const polyLine = [18.01752, 59.404045, 0, -0.000009];

  function convertPolylines(polyline) {
    const convertedPolylines = polyline.map((polyline) => {
      if (polyline.length === 2 && Array.isArray(polyline[0])) {
        // Case 1: The polyline is represented as a list of absolute coordinates
        return polyline;
      } else {
        // Case 2: The polyline is represented as the first absolute coordinate
        // followed by the differences of the other points relative to the first one
        const [startLongitude, startLatitude, ...differences] = polyline;
        const coordinates = [[startLongitude, startLatitude]];

        for (let i = 0; i < differences.length; i += 2) {
          const lastCoordinate = coordinates[coordinates.length - 1];
          const longitude = lastCoordinate[0] + differences[i];
          const latitude = lastCoordinate[1] + differences[i + 1];
          coordinates.push([longitude, latitude]);
        }

        return coordinates;
      }
    });

    return convertedPolylines;
  }

  // Update the useEffect to handle an array of polyline data
  useEffect(() => {
    console.log("polyline: ", polyline);
    if (map && polyline) {
      const source = map.getSource("polyline") as mapboxgl.GeoJSONSource;

      // Convert the polyline data to GeoJSON format
      const geoJSONData = {
        type: "FeatureCollection",
        features: convertPolylines(polyline).map((coordinates) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
          properties: {},
        })),
      };

      source.setData(geoJSONData);
    }
  }, [polyline, map]);

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

        const test = [
          [17.892043, 60.12335],
          [18.148423, 59.243129],
        ];

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
            "line-color": "#ff0000", // Change this to your desired color for the polyline
            "line-width": 5,
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
