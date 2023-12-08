"use client";
import { useState, useEffect, useRef } from "react";
import mapboxgl, { LngLatLike, Popup } from "mapbox-gl";
import { buffer, bbox, bboxPolygon, point } from "@turf/turf";
import { getTravelTime } from "@/queries/getTravelTime";
import { getPricesWithLocations } from "@/queries/getAppartmentPrices";
import "./Map.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import ClipLoader from "react-spinners/ClipLoader";

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
  loadingStatus: any;
  travelTimeMode: string;
  travelTime: number;
  mapVisualisationMode: string;
}

interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
  averagePrice?: number;
}

interface ILocationPrice {
  lng: number;
  lat: number;
  averagePrice: number;
}

let firstMapIdle: boolean = true;
let firstTimeInitializingMap: boolean = true;

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
  loadingStatus,
  travelTimeMode,
  travelTime,
  mapVisualisationMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<IMap | null>(null);
  const [mapTheme, setMapTheme] = useState<string>("dark");
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [loadingNewTravelData, setLoadingNewTravelData] =
    useState<boolean>(false);
  const [appartmentPriceData, setAppartmentPriceData] = useState<
    ILocationPrice[]
  >([]);

  let popup: Popup | null = null;

  let travelTimeData: ILocation[] = [];
  let initiatedLoadingTravelTimeData: boolean = false;

  useEffect(() => {
    const fetchPrices = async () => {
      if (
        mapVisualisationMode === "money" &&
        appartmentPriceData.length === 0
      ) {
        try {
          const pricesData = await getPricesWithLocations();
          setAppartmentPriceData(pricesData);
          console.log("pricesData", pricesData);
        } catch (error) {
          console.error("Error fetching prices:", error);
        }
      }
    };

    fetchPrices();
  }, [mapVisualisationMode, appartmentPriceData.length]);

  useEffect(() => {
    async function initializeMap() {
      if (!initiatedLoadingTravelTimeData) {
        initiatedLoadingTravelTimeData = true;
        travelTimeData = await getTravelTime(
          travelTimeMode === "avg_include_wait",
          travelTime
        );
        console.log("travelTimeData", travelTimeData);
      }

      const markerElement = document.createElement("div");
      markerElement.className = "marker";

      // Create a new Mapbox GL JS map
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style:
          mapTheme === "light"
            ? "mapbox://styles/mapbox/streets-v11"
            : "mapbox://styles/axeln/clgp2ccxh00gs01pc0iat3y1d",
        center: [18.0686, 59.3293],
        zoom: 11,
      }) as IMap;

      const idleListener = () => {
        if (firstMapIdle) {
          updateLoadingStatus("complete");
          mapInstance.off("idle", idleListener);
        }
        firstMapIdle = false;
      };

      mapInstance.on("idle", idleListener);

      mapInstance.on("load", () => {
        setMapInitialized(true);

        console.log("traveltimedata: ", travelTimeData);
        console.log("appartmentPriceData: ", appartmentPriceData);

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

        // Find water layer
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

        // Add a heatmap layer
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
                colors[0],
                limits[0],
                colors[1],
                limits[1],
                colors[2],
                limits[2],
                colors[3],
              ],
              "fill-opacity": 1,
            },
          },
          waterLayerId // the travel time layer before the first symbol layer
        );
      });

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

  useEffect(() => {
    if (map) {
      map.on("load", () => {
        if (selectedPopupMode === "Travel details") {
          map.addSource("polyline", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          map.addLayer({
            id: "polyline",
            type: "line",
            source: "polyline",
            paint: {
              "line-color": [
                "case",
                ["boolean", ["get", "isHovered"], false],
                "#ffffff",
                "#ff0000",
              ],
              "line-width": 5,
            },
          });

          map.addLayer({
            id: "invisible-polyline-hover",
            type: "line",
            source: "polyline",
            paint: {
              "line-color": "transparent",
              "line-width": 25,
            },
          });

          map.addSource("circle", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          map.addLayer({
            id: "circle",
            type: "circle",
            source: "circle",
            paint: {
              "circle-radius": 6,
              "circle-color": [
                "case",
                ["boolean", ["get", "isHovered"], false],
                "#ffffff",
                "#ff0000",
              ],
            },
          });
        }

        map.on("click", (e) => {
          const coordinates: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

          // Remove the previous marker if it exists
          if (map.hasOwnProperty("currentMarker")) {
            (map as any).currentMarker.remove();
          }

          const newMarker = new mapboxgl.Marker({
            color: `#1E232D`,
          })
            .setLngLat(coordinates)
            .addTo(map);

          (map as any).currentMarker = newMarker;

          onMapClick(coordinates, map as IMap);

          const featuresAtPosition: any = map.queryRenderedFeatures(e.point, {
            layers: ["travelTimeGrid"],
          });

          if (featuresAtPosition.length > 0) {
            const travelTimeData = featuresAtPosition[0].properties.fastestTime;
          }
        });
      });
    }
  }, [map, selectedPopupMode]);

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
              legId: index,
            },
          })
        ),
      };
      if (source) {
        source.setData(geoJSONData);
      }

      const circleSource = map.getSource("circle") as mapboxgl.GeoJSONSource;
      const circleGeoJSONData: any = {
        type: "FeatureCollection",
        features: getCircleFeatures(convertedPolylines),
      };
      if (circleSource) {
        circleSource.setData(circleGeoJSONData);
      }
    } else if (map) {
      const source = map.getSource("polyline") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: [],
        });
      }

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
      const newTravelTimeData = await getTravelTime(
        travelTimeMode === "avg_include_wait",
        travelTime
      );

      if (map && map.getSource("travelTimeData")) {
        if (mapVisualisationMode === "time") {
          (map.getSource("travelTimeData") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: newTravelTimeData.map((location: ILocation) => {
              const center = point([location.lng, location.lat]);
              const buffered = buffer(center, 50, { units: "meters" });
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
        } else if (mapVisualisationMode === "money") {
          console.log("appartmentPriceData", appartmentPriceData);
          (map.getSource("travelTimeData") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: appartmentPriceData.map((location: ILocationPrice) => {
              const center = point([location.lng, location.lat]);
              const buffered = buffer(center, 200, { units: "meters" });
              const squarePolygon = bboxPolygon(bbox(buffered));

              return {
                type: "Feature",
                geometry: squarePolygon.geometry,
                properties: {
                  fastestTime: location.averagePrice,
                },
              };
            }),
          });
        }
      }
    }
    if (loadingStatus.complete) {
      setLoadingNewTravelData(true);
      updateTravelTimeData().then(() => {
        setLoadingNewTravelData(false);
      });
    }
  }, [travelTime, mapVisualisationMode, appartmentPriceData]);



  //const [limits, setLimits] = useState<number[]>([greenLimit, 15 + greenLimit, 45 + greenLimit]);

  let limits = [greenLimit, 15 + greenLimit, 45 + greenLimit];

  if (mapVisualisationMode === "time") {
  } else {
    limits = [40000, 80000, 120000];
  }

  console.log("limits: ", limits)
  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  // Update heatmap layer's paint property when greenLimit changes
  useEffect(() => {
    console.log("update heatmap colors: ", limits);
    if (map && map.getLayer("travelTimeGrid")) {
      map.setPaintProperty("travelTimeGrid", "fill-color", [
        "interpolate",
        ["linear"],
        ["get", "fastestTime"],
        0,
        colors[0],
        limits[0],
        colors[1],
        limits[1],
        colors[2],
        limits[2],
        colors[3],
      ]);
    }

    updateMap();
  }, [map, greenLimit, limits]);

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
      map.on("mousemove", "invisible-polyline-hover", hoverFeature);
      map.on("mouseleave", "invisible-polyline-hover", unhoverFeature);

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
          ? "mapbox://styles/mapbox/streets-v11"
          : "mapbox://styles/axeln/clgp2ccxh00gs01pc0iat3y1d"
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
    [markerLngLat.lng - longDiff, markerLngLat.lat - latDiff],
    [markerLngLat.lng - longDiff, markerLngLat.lat + latDiff],
    [markerLngLat.lng + longDiff, markerLngLat.lat + latDiff],
    [markerLngLat.lng + longDiff, markerLngLat.lat - latDiff],
    [markerLngLat.lng - longDiff, markerLngLat.lat - latDiff],
  ];

  const holePolygon = [
    [
      [-180, -90],
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90],
    ],
    squareLngLat,
  ];

  if (map.getLayer("square-fill")) {
    map.removeLayer("square-fill");
    map.removeLayer("square-border");
  }

  if (map.getSource("square")) {
    map.removeSource("square");
  }

  if (!doesLayerExist("square", map) && !doesSourceExist("square", map)) {
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
  } catch (e) { }
};

function doesLayerExist(layerId: string, map: any) {
  const layers = map.getStyle().layers;
  return layers.some((layer: any) => layer.id === layerId);
}

function doesSourceExist(sourceId: string, map: any) {
  const sources = map.getStyle().sources;
  return sources.hasOwnProperty(sourceId);
}


function fetchAppertmentPriceData() {
  const sources = map.getStyle().sources;
  return sources.hasOwnProperty(sourceId);
}
