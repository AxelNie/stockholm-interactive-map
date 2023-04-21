import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  SVGOverlay,
  useMapEvents,
  Pane,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTravelTime } from "@/queries/getTravelTime";
import { buildTree, findClosestNode } from "@/lib/KDtree";
import { icon } from "leaflet";
import Image from "next/image";
import "./map.css";

const marker = "/marker.svg";

const ICON = icon({
  iconUrl: marker,
  iconSize: [32, 32],
});

interface MapClickHandlerProps {
  setClickedLocationData: (data: TravelTimeData | null) => void;
  setClickedLocation: (location: Coordinate | null) => void;
  travelDistancesGrid: any;
}

interface MapOverlayProps {
  travelDistancesGrid: any;
  setLoadingStateRender: (value: boolean) => void;
}

interface Coordinate {
  lat: number;
  lng: number;
}

interface TravelTimeData {
  lat: number;
  lng: number;
  fastestTime: number;
}

async function getTravelTimes(coordinates: Coordinate[]): Promise<number[]> {
  const url = "http://localhost:3000/api/getTravelTime";
  const data = { positions: coordinates };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const travelTimes = await response.json();

    return travelTimes;
  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
    // You may want to return an appropriate fallback value or rethrow the error
    // depending on how you want to handle errors in your application.
    return [];
  }
}

// Function to get the color for a given travel time
const getColorForTravelTime = (travelTime: number) => {
  // You can use a color scale or any other method to map the travel time to a color
  if (travelTime <= 15) {
    return "#00FF00"; // Green
  } else if (travelTime < 30) {
    return "#FFFF00"; // Yellow
  } else if (travelTime < 45) {
    return "#FFA500"; // Orange
  } else if (travelTime < 150) {
    return "#FF0000"; // Red
  } else {
    return "#000000"; // Black
  }
};

async function drawOverlay(
  map: L.Map | null,
  travelDistancesGrid: TravelTimeData[]
): Promise<JSX.Element | null> {
  if (map !== null && travelDistancesGrid !== null) {
    const width = map.getSize().x;
    const height = map.getSize().y;

    // Create an array to store the rectangles
    const rectangles = [];

    // Set the size of each rectangle to cover 10 pixels
    const rectSize = 4;

    console.log("RENDERING POINTS...");
    let rendered_points = 0;

    // Get the points

    for (let x = 0; x < width + rectSize / 2; x += rectSize) {
      for (let y = 0; y < height + rectSize / 2; y += rectSize) {
        rendered_points++;
        const point = map.layerPointToLatLng(
          map.containerPointToLayerPoint(L.point(x, y))
        );
        const targetPoint = { lat: point.lat, lng: point.lng };

        if (
          targetPoint.lat > 59.145848 &&
          targetPoint.lat < 59.659036 &&
          targetPoint.lng > 17.579331 &&
          targetPoint.lng < 18.360638
        ) {
          const closestNode = findClosestNode(travelDistancesGrid, targetPoint);
          const fill = getColorForTravelTime(closestNode.fastestTime);

          rectangles.push(
            <rect
              key={`${x}-${y}`}
              x={x - rectSize / 2}
              y={y - rectSize / 2}
              width={rectSize}
              height={rectSize}
              fill={fill}
            />
          );
        }
      }
    }
    console.log("rendered_points: ", rendered_points);

    return (
      <svg width={width} height={height}>
        <defs>
          <pattern
            id="pattern"
            patternUnits="userSpaceOnUse"
            width={width}
            height={height}
          >
            {rectangles}
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#pattern)" />
      </svg>
    );
  } else {
    return null;
  }
}

function MapOverlay(props: MapOverlayProps): JSX.Element | null {
  const parentMap = useMap();
  const [rectangles, setRectangles] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await drawOverlay(parentMap, props.travelDistancesGrid);
      setRectangles(data);
      console.log("DONE RENDERING!");
    };
    fetchData();
  }, [parentMap, props.travelDistancesGrid]);

  const onChange = useCallback(() => {
    drawOverlay(parentMap, props.travelDistancesGrid).then((data) => {
      setRectangles(data);
      console.log("DONE RENDERING!");
    });
  }, [parentMap, props.travelDistancesGrid]);

  useEffect(() => {
    parentMap.on("moveend", onChange);
    return () => {
      parentMap.off("moveend", onChange);
    };
  }, [parentMap, onChange]);

  return (
    <Pane name="customPane" style={{ zIndex: 500 }}>
      <SVGOverlay className="svg" bounds={parentMap.getBounds()}>
        {rectangles}
      </SVGOverlay>
    </Pane>
  );
}

function MapClickHandler({
  setClickedLocationData,
  setClickedLocation,
  travelDistancesGrid,
}: MapClickHandlerProps) {
  const map = useMapEvents({
    click: (event) => {
      console.log("clicked");
      const clickedPoint = event.latlng;
      const closestNode = findClosestNode(travelDistancesGrid, clickedPoint);
      setClickedLocationData(closestNode);
      setClickedLocation(clickedPoint); // Set the clicked location
    },
  });

  return null;
}

function Map() {
  const [travelDistancesGrid, setTravelDistancesGrid] = useState(null);
  const intializedLoadOfData = useRef(false);
  const [clickedLocationData, setClickedLocationData] = useState(null);
  const [clickedLocation, setClickedLocation] = useState<Coordinate | null>(
    null
  );

  useEffect(
    () => {
      const fetchData = async () => {
        if (!intializedLoadOfData.current) {
          intializedLoadOfData.current = true;
          console.log("fetching data from getTravelDistancesGrid");
          const result: TravelTimeData[] = await getTravelTime();
          console.log("fetched data: ", result);
          const tree = buildTree(result);
          setTravelDistancesGrid(tree);
          console.log("DONE LOADING!");
        }
      };
      fetchData();
    },
    [
      /* never changes */
    ]
  );

  return (
    <div className="container">
      <MapContainer
        style={{ height: "90vh" }}
        center={[59.3293, 18.0686]}
        zoom={11}
        maxZoom={15}
        className="map-container"
      >
        <TileLayer
          className="map"
          url={process.env.NEXT_PUBLIC_MAP_STYLE_API_URL}
          attribution="© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
        />
        <MapOverlay
          className="overlay"
          travelDistancesGrid={travelDistancesGrid}
        />
        {clickedLocation && (
          <Marker position={clickedLocation} icon={ICON}>
            <Popup>
              {clickedLocationData ? (
                <div>
                  <p>Latitude: {clickedLocationData.lat.toFixed(6)}</p>
                  <p>Longitude: {clickedLocationData.lng.toFixed(6)}</p>
                  <p>
                    Fastest travel time: {clickedLocationData.fastestTime}{" "}
                    minutes
                  </p>
                </div>
              ) : (
                <p>Loading travel time...</p>
              )}
            </Popup>
          </Marker>
        )}
        <MapClickHandler
          setClickedLocationData={setClickedLocationData}
          setClickedLocation={setClickedLocation}
          travelDistancesGrid={travelDistancesGrid}
        />
      </MapContainer>
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
