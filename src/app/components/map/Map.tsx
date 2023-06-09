"use client";
import { useState, useEffect, useRef } from "react";
import mapboxgl, { LngLatLike, Popup } from "mapbox-gl";
import { buffer, bbox, bboxPolygon, point } from "@turf/turf";
import { getTravelTime } from "@/queries/getTravelTime";
import "./Map.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import ClipLoader from "react-spinners/ClipLoader";

// Get your Mapbox access token from the environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface IMap extends mapboxgl.Map {
  currentMarker?: mapboxgl.Marker | null;
}

interface MapProps {
  onMapClick: (coordinates: LngLatLike, map: IMap) => void;
  greenLimit: number;
  polyline: Array<Array<number> | number[]>;
  hoveredLegId: number | null;
  onLegHover: (legId: number | null, isHovering: boolean) => void;
  housingPriceRadius: number;
  selectedPopupMode: string;
  showInfoPopup: boolean;
  updateLoadingStatus: (status: string) => void;
  travelTimeMode: string;
  travelTime: number;
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
  onLegHover,
  housingPriceRadius,
  selectedPopupMode,
  showInfoPopup,
  updateLoadingStatus,
  travelTimeMode,
  travelTime,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<IMap | null>(null);
  const [mapTheme, setMapTheme] = useState<string>("dark");
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [loadingNewTravelData, setLoadingNewTravelData] =
    useState<boolean>(false);

  let popup: Popup | null = null;

  useEffect(() => {
    async function initializeMap() {
      // Load travel time data
      const travelTimeData = await getTravelTime(
        travelTimeMode === "avg_include_wait",
        travelTime
      );

      const markerElement = document.createElement("div");
      markerElement.className = "marker";

      // Create a new Mapbox GL JS map
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style:
          mapTheme === "light"
            ? "mapbox://styles/mapbox/streets-v11" // Change this to the desired light style
            : "mapbox://styles/axeln/clgp2ccxh00gs01pc0iat3y1d", // The current dark style
        center: [18.0686, 59.3293],
        zoom: 11,
      }) as IMap;

      mapInstance.on("load", () => {
        setMapInitialized(true);
        updateLoadingStatus("travelDistancesLoaded");
        if (selectedPopupMode === "Travel details") {
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
        }

        // Add a GeoJSON source for the travel time data
        mapInstance.addSource("travelTimeData", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: travelTimeData.map((location: ILocation) => {
              const center = point([location.lng, location.lat]);
              const buffered = buffer(center, 65, { units: "meters" });
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
        updateLoadingStatus("travelDistancesLoaded");

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

        // Add the invisible polyline layer for hovering
        mapInstance.addLayer({
          id: "invisible-polyline-hover",
          type: "line",
          source: "polyline",
          paint: {
            "line-color": "transparent",
            "line-width": 25, // Adjust the width for the desired hitbox size
          },
        });

        updateLoadingStatus("complete");
      });

      mapInstance.on("click", (e) => {
        const coordinates: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

        // Remove the previous marker if it exists
        if (mapInstance.hasOwnProperty("currentMarker")) {
          (mapInstance as any).currentMarker.remove();
        }

        // Create a new marker and add it to the map
        const newMarker = new mapboxgl.Marker({
          color: `#1E232D`,
        })
          .setLngLat(coordinates)
          .addTo(mapInstance);

        // Store the new marker directly on the map instance
        (mapInstance as any).currentMarker = newMarker;

        onMapClick(coordinates, mapInstance as IMap);

        // Logging positon time for testing

        // Query the travel time data at the clicked position
        const featuresAtPosition: any = mapInstance.queryRenderedFeatures(
          e.point,
          {
            layers: ["travelTimeGrid"],
          }
        );

        // If there's a feature at the clicked position, log its travel time data
        if (featuresAtPosition.length > 0) {
          const travelTimeData = featuresAtPosition[0].properties.fastestTime;
        }
      });

      // Add a 'mouseleave' event listener for the travelTimeGrid layer to remove the popup
      mapInstance.on("mouseleave", "travelTimeGrid", () => {
        if (popup) {
          popup.remove();
          popup = null;
        }
      });

      updateLoadingStatus("mapLoaded");
      setMap(mapInstance);
    }

    if (!map) {
      initializeMap();
    }
  }, [map, onMapClick, selectedPopupMode]);

  // Update the useEffect to handle an array of polyline data
  useEffect(() => {
    if (map && polyline && selectedPopupMode === "Travel details") {
      const source = map.getSource("polyline") as mapboxgl.GeoJSONSource;
      const convertedPolylines = convertPolylines(polyline, hoveredLegId);
      const geoJSONData: any = {
        type: "FeatureCollection",
        features: convertedPolylines.map(
          ({ coordinates, isHovered }: any, index: any) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {
              isHovered,
              legId: index, // Set the legId property
            },
          })
        ),
      };
      if (source) {
        source.setData(geoJSONData);
      }

      // Handle the circle features
      const circleSource = map.getSource("circle") as mapboxgl.GeoJSONSource;
      const circleGeoJSONData: any = {
        type: "FeatureCollection",
        features: getCircleFeatures(convertedPolylines),
      };
      if (circleSource) {
        circleSource.setData(circleGeoJSONData);
      }
    } else if (map) {
      // Remove polyline features
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
  }, [map, polyline, hoveredLegId, selectedPopupMode]);

  // Update travel time overlay when mode or time changes
  useEffect(() => {
    async function updateTravelTimeData() {
      // Fetch new travel time data
      const newTravelTimeData = await getTravelTime(
        travelTimeMode === "avg_include_wait",
        travelTime
      );

      // Update the travel time data on the map
      if (map && map.getSource("travelTimeData")) {
        (map.getSource("travelTimeData") as mapboxgl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: newTravelTimeData.map((location: ILocation) => {
            const center = point([location.lng, location.lat]);
            const buffered = buffer(center, 65, { units: "meters" });
            const squarePolygon = bboxPolygon(bbox(buffered));

            return {
              type: "Feature",
              geometry: squarePolygon.geometry,
              properties: {
                fastestTime: location.fastestTime,
              },
            };
          }),
        });
      }
    }
    setLoadingNewTravelData(true);
    console.log("Updating travel time data");
    updateTravelTimeData().then(() => {
      setLoadingNewTravelData(false);
      console.log("Finished updating travel time data");
    });
  }, [travelTime]);

  const limits = [greenLimit, 15 + greenLimit, 45 + greenLimit];
  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  // Update heatmap layer's paint property when greenLimit changes
  useEffect(() => {
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

  useEffect(() => {
    if (map) {
      if (selectedPopupMode == "Housing prices" && showInfoPopup == true) {
        addSquareAroundMaker(map, housingPriceRadius);
      } else {
        removeSquareAroundMaker(map);
      }

      if (showInfoPopup == false) {
        removeSquareAroundMaker(map);
      }
    }
  }, [map, selectedPopupMode, housingPriceRadius, onMapClick, showInfoPopup]);

  useEffect(() => {
    if (map) {
      // Add the event listeners
      map.on("mousemove", "invisible-polyline-hover", hoverFeature);
      map.on("mouseleave", "invisible-polyline-hover", unhoverFeature);

      // Clean up the event listeners
      return () => {
        map.off("mousemove", "invisible-polyline-hover", hoverFeature);
        map.off("mouseleave", "invisible-polyline-hover", unhoverFeature);
      };
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      map.setStyle(
        mapTheme === "light"
          ? "mapbox://styles/mapbox/streets-v11" // Change this to the desired light style
          : "mapbox://styles/axeln/clgp2ccxh00gs01pc0iat3y1d" // The current dark style
      );
    }
  }, [map, mapTheme]);

  const updateMap = () => {
    if (map) {
      map.resize();
    }
  };

  function hoverFeature(e: mapboxgl.MapMouseEvent) {
    const features = e.target.queryRenderedFeatures(e.point);
    if (features && features.length > 0) {
      const legId = features[0].properties?.legId;
      onLegHover(legId, true);
    }
  }

  function unhoverFeature(e: mapboxgl.MapMouseEvent) {
    onLegHover(null, false);
  }

  return (
    <>
      <div className="container">
        {loadingNewTravelData && (
          <div className="loading">
            <ClipLoader
              size={35}
              color="#5ADF92"
              speedMultiplier={0.7}
              className="loader"
            />
            <p>Loading new travel time data...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="map-container" />
      </div>
    </>
  );
};

export default Map;

function convertPolylines(polyline: any, hoveredLegId: number | null) {
  const convertedPolylines = polyline.map((polyline: any, index: number) => {
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

function getCircleFeatures(convertedPolylines: any) {
  const circleFeatures: any = [];

  const combinedCircles: any = {};

  convertedPolylines.forEach(({ coordinates, isHovered }: any) => {
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

const addSquareAroundMaker = (map: any, housingPriceRadius: number) => {
  // Get the marker's position in geographic coordinates
  const marker = map.currentMarker;
  var markerLngLat = marker.getLngLat();

  const latDiff = ((0.001806 / 2.0) * housingPriceRadius) / 100.0 / 2.0;
  const longDiff = ((0.006618 / 3.75) * housingPriceRadius) / 100.0 / 2.0;

  // Compute the square's coordinates
  var squareLngLat = [
    [markerLngLat.lng - longDiff, markerLngLat.lat - latDiff], // bottom left
    [markerLngLat.lng - longDiff, markerLngLat.lat + latDiff], // top left
    [markerLngLat.lng + longDiff, markerLngLat.lat + latDiff], // top right
    [markerLngLat.lng + longDiff, markerLngLat.lat - latDiff], // bottom right
    [markerLngLat.lng - longDiff, markerLngLat.lat - latDiff], // back to bottom left
  ];

  const holePolygon = [
    // Cover the whole world
    [
      [-180, -90],
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90],
    ],
    // Your square (the hole)
    squareLngLat,
  ];

  // Remove old square layer if it exists
  if (map.getLayer("square-fill")) {
    map.removeLayer("square-fill");
    map.removeLayer("square-border");
  }

  // Remove old square source if it exists
  if (map.getSource("square")) {
    map.removeSource("square");
  }

  if (!doesLayerExist("square", map) && !doesSourceExist("square", map)) {
    // Add a square to the map
    map.addSource("square", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: holePolygon,
        },
      },
    });

    // Add fill layer
    map.addLayer({
      id: "square-fill",
      type: "fill",
      source: "square",
      layout: {},
      paint: {
        "fill-color": "#0F1319",
        "fill-opacity": 0.3,
      },
    });

    // Add border layer
    map.addLayer({
      id: "square-border",
      type: "line",
      source: "square",
      layout: {},
      paint: {
        "line-color": "#ffffff",
        "line-width": 1,
        "line-opacity": 0.5,
      },
    });
  } else {
    const mySource = map.getSource("square");

    mySource.setData({
      type: "geojson",
      data: {
        type: "Polygon",
        coordinates: [squareLngLat],
      },
    });
  }
};

const removeSquareAroundMaker = (map: any) => {
  try {
    if (map.getLayer("square-fill") && map.getLayer("square-border")) {
      map.removeLayer("square-fill");
      map.removeLayer("square-border");
    }
  } catch (e) {}
};

function doesLayerExist(layerId: string, map: any) {
  const layers = map.getStyle().layers;
  return layers.some((layer: any) => layer.id === layerId);
}

// Check if a source with a specific ID exists
function doesSourceExist(sourceId: string, map: any) {
  const sources = map.getStyle().sources;
  return sources.hasOwnProperty(sourceId);
}
