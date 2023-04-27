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
  highlightedPolyline: string | null;
}

interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
}

const Map: React.FC<MapProps> = ({
  onMapClick,
  greenLimit,
  highlightedPolyline,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map && highlightedPolyline) {
      const source = map.getSource(
        "highlightedPolyline"
      ) as mapboxgl.GeoJSONSource;
      source.setData(JSON.parse(highlightedPolyline));
    }
  }, [highlightedPolyline, map]);

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

        // Inside the 'load' event handler
        mapInstance.addLayer({
          id: "highlightedPolyline",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          },
          paint: {
            "line-color": "#007cbf",
            "line-width": 5,
          },
        });
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
