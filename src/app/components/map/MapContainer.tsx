"use client";
import React, { useState } from "react";
import { LngLatLike } from "mapbox-gl";
import Map from "./Map";
import InfoPopup from "./InfoPopup";
import OverlayControls from "./OverlayControls";
import "./MapContainer.scss";

type MapInstanceType = {
  map: mapboxgl.Map | null;
  currentMarker?: mapboxgl.Marker | null;
};
const MapContainer = () => {
  const [mapInstance, setMapInstance] = useState<MapInstanceType | null>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState<any>(null);
  const [greenLimit, setGreenLimit] = useState(15);
  const [polyline, setPolyline] = useState<any>(null);
  const [hoveredLegId, setHoveredLegId] = useState<number | null>(null);
  const InfoPopupModes = ["Travel details", "Housing prices"];
  const [selectedOption, setSelectedOption] = useState(InfoPopupModes[0]);
  const [housingPriceRadius, setHousingPriceRadius] = useState(1000);

  const handleLegHover = (id: number | null, isHovering: boolean) => {
    setHoveredLegId(isHovering ? id : null);
  };

  const handleSliderChange = (event: any, newValue: number) => {
    setHousingPriceRadius(newValue);
  };

  const onMapClick = (coordinates: LngLatLike, map: MapInstanceType) => {
    setShowInfoPopup(true);
    setClickedCoordinates(coordinates);
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

  const handleInfoPopupModeToggle = () => {
    if (selectedOption === InfoPopupModes[0]) {
      setSelectedOption(InfoPopupModes[1]);
    } else {
      setSelectedOption(InfoPopupModes[0]);
    }
  };

  const handlePolylineData = (polylineData: any) => {
    setPolyline(polylineData);
    console.log("polylineData: ", polylineData);
  };

  return (
    <div className="main-map-container">
      <Map
        onMapClick={onMapClick}
        greenLimit={greenLimit}
        polyline={polyline}
        hoveredLegId={hoveredLegId}
        onLegHover={handleLegHover}
        housingPriceRadius={housingPriceRadius}
        selectedPopupMode={selectedOption}
      />
      {showInfoPopup && (
        <InfoPopup
          coordinates={clickedCoordinates}
          onClose={handleInfoPopupClose}
          onPolylineData={handlePolylineData}
          hoveredLegId={hoveredLegId}
          onLegHover={handleLegHover}
          onToggle={handleInfoPopupModeToggle}
          selectedOption={selectedOption}
          housingPriceRadius={housingPriceRadius}
          handleSliderChange={handleSliderChange}
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
