// MapContainer.js
import React, { useState } from "react";
import Map from "./Map";
import InfoPopup from "./InfoPopup";

const MapContainer = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);

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
  };

  return (
    <div>
      {/* Pass the onMapClick function and the setMap function as props */}
      <Map onMapClick={onMapClick} />
      {/* Conditionally render the InfoPopup component */}
      {showInfoPopup && (
        <InfoPopup
          coordinates={clickedCoordinates}
          onClose={handleInfoPopupClose}
        />
      )}
    </div>
  );
};

export default MapContainer;
