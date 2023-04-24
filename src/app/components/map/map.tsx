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
}

interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
}

const Map: React.FC<MapProps> = ({ onMapClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

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
              "fill-opacity": 0.4,
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

  return (
    <div className="container">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
};

export default Map;
