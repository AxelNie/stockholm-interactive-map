"use client";
import React, { useState, useEffect, use } from "react";
import { LngLatLike } from "mapbox-gl";
import InfoPopup from "./InfoPopup";
import Map from "./Map";
import OverlayControls from "./OverlayControls";
import LoadingOverlay from "./LoadingOverlay";
import "./MapContainer.scss";
import TravelTimeModeSelector from "./TravelTimeModeSelector";
import Filter from "./Filter";
import MapModeSelector from "./MapModeSelector";

interface MapInstanceType extends mapboxgl.Map {
  currentMarker?: mapboxgl.Marker | null;
}

type RangeState = {
  range: number[];
  active: boolean;
  savedActive: boolean;
  savedRange: number[];
};

const MapContainer = () => {
  const [mapInstance, setMapInstance] = useState<MapInstanceType | null>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState<any>(null);
  const [limits, setLimits] = useState<number[]>([15, 30, 60]);
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
  const [displayLoading, setDisplayLoading] = useState<boolean>(true);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [mapVisualisationMode, setMapVisualisationMode] =
    useState<string>("time");
  const minValuePrice = 10000;
  const maxValuePrice = 120000;
  const minValueTime = 0;
  const maxValueTime = 90;
  const [priceState, setPriceState] = useState<RangeState>({
    range: [10000, 120000],
    active: false,
    savedActive: false,
    savedRange: [10000, 120000],
  });
  const [timeState, setTimeState] = useState<RangeState>({
    range: [minValueTime, maxValueTime],
    active: false,
    savedActive: false,
    savedRange: [minValueTime, maxValueTime],
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isMapModeSelectorExpanded, setIsMapModeSelectorExpanded] = useState(false);

  useEffect(() => {
    const onClick = (event: Event) => { };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (isMapModeSelectorExpanded) {
      setIsFilterExpanded(false);
    }
  }, [isMapModeSelectorExpanded]);

  useEffect(() => {
    if (isFilterExpanded) {
      setIsMapModeSelectorExpanded(false);
    }
  }, [isFilterExpanded]);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === "P" || event.key === "p") {
        setMapVisualisationMode("money");
      } else if (event.key === "T" || event.key === "t") {
        setMapVisualisationMode("time");
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    setIsMobileDevice(window.innerWidth < 760);

    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 760);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    setIsFilterExpanded(false);
    setIsMapModeSelectorExpanded(false);
  };

  const handleInfoPopupClose = () => {
    if (mapInstance && mapInstance.currentMarker) {
      mapInstance.currentMarker.remove();
    }
    setShowInfoPopup(false);

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
        limits={limits}
        polyline={polyline}
        hoveredLegId={hoveredLegId}
        onLegHover={handleLegHover}
        housingPriceRadius={housingPriceRadius}
        selectedPopupMode={selectedOption}
        showInfoPopup={showInfoPopup}
        updateLoadingStatus={onUpdateMapLoadingStatus}
        loadingStatus={loadingStatus}
        travelTimeMode={travelTimeMode}
        travelTime={travelTime}
        mapVisualisationMode={mapVisualisationMode}
        priceState={priceState}
        timeState={timeState}
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
          isMobileDevice={isMobileDevice}
        />
      )}
      <OverlayControls
        limits={limits}
        setLimits={setLimits}
        isMobileDevice={isMobileDevice}
        mapVisualisationMode={mapVisualisationMode}
      />
      {mapVisualisationMode === "time" ?
        <TravelTimeModeSelector
          travelTimeMode={travelTimeMode}
          setTravelTimeMode={setTravelTimeMode}
          travelTime={travelTime}
          setTravelTime={setTravelTime}
          isMobileDevice={isMobileDevice}
        />
        : null}
      <MapModeSelector
        priceState={priceState}
        setPriceState={setPriceState}
        timeState={timeState}
        setTimeState={setTimeState}
        isMobileDevice={isMobileDevice}
        mapVisualisationMode={mapVisualisationMode}
        setMapVisualisationMode={setMapVisualisationMode}
        isMapModeSelectorExpanded={isMapModeSelectorExpanded}
        setIsMapModeSelectorExpanded={setIsMapModeSelectorExpanded}
      />
      <Filter
        priceState={priceState}
        setPriceState={setPriceState}
        timeState={timeState}
        setTimeState={setTimeState}
        minValuePrice={minValuePrice}
        maxValuePrice={maxValuePrice}
        minValueTime={minValueTime}
        maxValueTime={maxValueTime}
        isMobileDevice={isMobileDevice}
        isFilterExpanded={isFilterExpanded}
        setIsFilterExpanded={setIsFilterExpanded}
      />
    </div>
  );
};

export default MapContainer;
