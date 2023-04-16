import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  SVGOverlay,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapOverlayProps {
  travelDistancesGrid: any;
  setLoadingStateRender: (value: boolean) => void;
}

interface Coordinate {
  lat: number;
  lng: number;
}

interface Coordinate {
  lat: number;
  lng: number;
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
    return "#00FF0050"; // Green
  } else if (travelTime < 30) {
    return "#FFFF0050"; // Yellow
  } else if (travelTime < 45) {
    return "#FFA50050"; // Orange
  } else if (travelTime < 150) {
    return "#FF000050"; // Red
  } else {
    return "#00000020"; // Black
  }
};

async function drawOverlay(map: L.Map | null) {
  if (map !== null) {
    const width = map.getSize().x;
    const height = map.getSize().y;

    // Create an array to store the rectangles
    const rectangles = [];

    // Set the size of each rectangle to cover X pixels
    const rectSize = 80;

    console.log("RENDERING POINTS...");
    let rendered_points = 0;

    var list_of_points: Coordinate[] = [];

    // Get the points
    for (let x = 0; x < width + rectSize / 2; x += rectSize) {
      for (let y = 0; y < height + rectSize / 2; y += rectSize) {
        rendered_points++;
        const point = map.layerPointToLatLng(
          map.containerPointToLayerPoint(L.point(x, y))
        );
        const targetPoint: Coordinate = { lat: point.lat, lng: point.lng };

        if (
          targetPoint.lat > 59.145848 &&
          targetPoint.lat < 59.659036 &&
          targetPoint.lng > 17.579331 &&
          targetPoint.lng < 18.360638
        ) {
          list_of_points.push(targetPoint);
        }
        {
        }
      }
    }

    let travel_time_for_points = await getTravelTimes(list_of_points);
    travel_time_for_points = travel_time_for_points.travelTimes;
    console.log("size: ", travel_time_for_points.length);

    for (var i = 0; i < travel_time_for_points.length; i++) {
      console.log("llop");
      const fill = getColorForTravelTime(travel_time_for_points[i]);
      const x = list_of_points[i].lat;
      const y = list_of_points[i].lng;
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
    console.log(rectangles);

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

function MapOverlay() {
  const parentMap = useMap();
  const [rectangles, setRectangles] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await drawOverlay(parentMap);
      setRectangles(data);
      console.log("DONE RENDERING!");
    };
    fetchData();
  }, [parentMap]);

  const onChange = useCallback(() => {
    drawOverlay(parentMap).then((data) => {
      setRectangles(data);

      console.log("DONE RENDERING!");
    });
  }, [parentMap]);

  useEffect(() => {
    parentMap.on("moveend", onChange);
    return () => {
      parentMap.off("moveend", onChange);
    };
  }, [parentMap, onChange]);

  return <SVGOverlay bounds={parentMap.getBounds()}>{rectangles}</SVGOverlay>;
}

function Map() {
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapOverlay className="overlay" />
      </MapContainer>
    </div>
  );
}

export default Map;
