"use client";
import React, { useState, useEffect } from "react";
import { LngLatLike } from "mapbox-gl";
import InfoPopup from "./InfoPopup";
import Map from "./Map";
import OverlayControls from "./OverlayControls";
import LoadingOverlay from "./LoadingOverlay";
import "./MapContainer.scss";
import TravelTimeModeSelector from "./TravelTimeModeSelector";

interface MapInstanceType extends mapboxgl.Map {
  currentMarker?: mapboxgl.Marker | null;
}

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
  const [loadingStatus, setLoadingStatus] = useState({
    mapLoaded: false,
    travelDistancesLoaded: false,
    complete: false,
  });
  const [travelTimeMode, setTravelTimeMode] = useState<string>("direct");
  const [travelTime, setTravelTime] = useState<number>(8);

  const [displayLoading, setDisplayLoading] = useState(true);

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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (loadingStatus.complete) {
      timeoutId = setTimeout(() => setDisplayLoading(false), 500);
    } else {
      setDisplayLoading(true);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingStatus.complete]);

  const onUpdateMapLoadingStatus = (state: string) => {
    console.log("state: ", state);
    if (state === "mapLoaded") {
      setLoadingStatus((prevState) => ({ ...prevState, mapLoaded: true }));
    } else if (state === "travelDistancesLoaded") {
      setLoadingStatus((prevState) => ({
        ...prevState,
        travelDistancesLoaded: true,
      }));
    } else if (state === "complete") {
      setLoadingStatus((prevState) => ({
        ...prevState,
        complete: true,
      }));
    }
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
  };

  return (
    <div className="main-map-container">
      {displayLoading && <LoadingOverlay status={loadingStatus} />}
      <Map
        onMapClick={onMapClick}
        greenLimit={greenLimit}
        polyline={polyline}
        hoveredLegId={hoveredLegId}
        onLegHover={handleLegHover}
        housingPriceRadius={housingPriceRadius}
        selectedPopupMode={selectedOption}
        showInfoPopup={showInfoPopup}
        updateLoadingStatus={onUpdateMapLoadingStatus}
        travelTimeMode={travelTimeMode}
        travelTime={travelTime}
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
          travelTime={travelTime}
        />
      )}
      <OverlayControls
        greenLimit={greenLimit}
        onGreenLimitChange={setGreenLimit}
      />
      <TravelTimeModeSelector
        travelTimeMode={travelTimeMode}
        setTravelTimeMode={setTravelTimeMode}
        travelTime={travelTime}
        setTravelTime={setTravelTime}
      />
    </div>
  );
};

export default MapContainer;
