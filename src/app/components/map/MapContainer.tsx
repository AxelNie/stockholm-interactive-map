// MapContainer.tsx
import React, { useState, useEffect } from "react";
import Map from "./Map";
import InfoPopup from "./InfoPopup";
import OverlayControls from "./OverlayControls";
import "./MapContainer.scss";

const MapContainer = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [greenLimit, setGreenLimit] = useState(15);
  const [polyline, setPolyline] = useState(null);
  const [hoveredLegId, setHoveredLegId] = useState<number | null>(null);

  const handleLegHover = (id: number, isHovering: boolean) => {
    setHoveredLegId(isHovering ? id : null);
  };

  const onMapClick = (coordinates, map) => {
    // Display the popup
    setShowInfoPopup(true);

    // Store the clicked coordinates
    setClickedCoordinates(coordinates);

    // Store the map instance
    setMapInstance(map);
  };

  const handleInfoPopupClose = () => {
    // Remove the marker from the map
    if (mapInstance && mapInstance.currentMarker) {
      mapInstance.currentMarker.remove();
    }

    // Hide the popup
    setShowInfoPopup(false);

    // Remove the polyline
    setPolyline(null);
  };

  const handlePolylineData = (polylineData) => {
    setPolyline(polylineData);
    console.log("polylineData: ", polylineData);
  };

  return (
    <div className="main-map-container">
      {/* Pass the onMapClick function and the setMap function as props */}
      <Map
        onMapClick={onMapClick}
        greenLimit={greenLimit}
        polyline={polyline}
        hoveredLegId={hoveredLegId}
        onLegHover={handleLegHover}
      />
      {/* Conditionally render the InfoPopup component */}
      {showInfoPopup && (
        <InfoPopup
          coordinates={clickedCoordinates}
          onClose={handleInfoPopupClose}
          onPolylineData={handlePolylineData}
          hoveredLegId={hoveredLegId}
          onLegHover={handleLegHover} // Pass the function as a prop
        />
      )}
      <OverlayControls
        greenLimit={greenLimit}
        onGreenLimitChange={setGreenLimit}
      />
    </div>
  );
};

export default MapContainer;
