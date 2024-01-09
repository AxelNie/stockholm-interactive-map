import React, { useState } from "react";
import "./MapModeSelector.scss";
import { FaMap } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { MdTimer } from "react-icons/md";
import "react-range-slider-input/dist/style.css";

interface MapModeSelectorComponentProps {
  priceState: {
    range: number[];
    active: boolean;
    savedActive: boolean;
    savedRange: number[];
  };
  timeState: {
    range: number[];
    active: boolean;
    savedActive: boolean;
    savedRange: number[];
  };
  setPriceState: React.Dispatch<
    React.SetStateAction<{
      range: number[];
      active: boolean;
      savedActive: boolean;
      savedRange: number[];
    }>
  >;
  setTimeState: React.Dispatch<
    React.SetStateAction<{
      range: number[];
      active: boolean;
      savedActive: boolean;
      savedRange: number[];
    }>
  >;
  isMobileDevice: boolean;
  mapVisualisationMode: string;
  setMapVisualisationMode: React.Dispatch<React.SetStateAction<string>>;
  isMapModeSelectorExpanded: boolean;
  setIsMapModeSelectorExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapModeSelector: React.FC<MapModeSelectorComponentProps> = ({
  priceState,
  setPriceState,
  timeState,
  setTimeState,
  isMobileDevice,
  mapVisualisationMode,
  setMapVisualisationMode,
  isMapModeSelectorExpanded,
  setIsMapModeSelectorExpanded,
}) => {
  const onClose = () => {
    setIsMapModeSelectorExpanded(false);
    setPriceState({
      ...priceState,
      range: priceState.savedRange,
      active: priceState.savedActive,
    });
    setTimeState({
      ...timeState,
      range: timeState.savedRange,
      active: timeState.savedActive,
    });
  };

  const getIcon = () => {
    if (mapVisualisationMode === "money") {
      return <MdAttachMoney />;
    }
    return <MdTimer />;
  };

  return (
    <div
      className={
        isMobileDevice
          ? "map-selector-container mobile"
          : "map-selector-container"
      }
    >
      {(!isMapModeSelectorExpanded || isMobileDevice) && (
        <button
          onClick={() =>
            setIsMapModeSelectorExpanded(!isMapModeSelectorExpanded)
          }
          className={
            isMapModeSelectorExpanded
              ? "map-mode-button active"
              : "filter-button"
          }
        >
          <h1>Map mode</h1>
          <div className="map-icon-wrapper">
            <FaMap className="map-icon" />
            <div className="circle">{getIcon()}</div>
          </div>
        </button>
      )}
      {isMapModeSelectorExpanded && (
        <div className="expanded-container">
          <div className="close-container">
            <MdOutlineClose onClick={() => onClose()} className="close-icon" />
          </div>
          <h1>Select map mode</h1>
          <div
            className={
              mapVisualisationMode === "time"
                ? "mode-container selected"
                : "mode-container"
            }
            onClick={() => {
              setMapVisualisationMode("time");
              setIsMapModeSelectorExpanded(false);
            }}
          >
            <div className="mode-icon">
              <MdTimer />
            </div>
            <div className="text">
              <h1>Travel Time</h1>
              <p>Travel time are represented as colors on the map.</p>
            </div>
          </div>
          <div
            className={
              mapVisualisationMode === "money"
                ? "mode-container selected"
                : "mode-container"
            }
            onClick={() => {
              setMapVisualisationMode("money");
              setIsMapModeSelectorExpanded(false);
            }}
          >
            <div className="mode-icon">
              <MdAttachMoney />
            </div>
            <div className="text">
              <h1>Price Per Square Meter</h1>
              <p>
                Average price price per square meter for appartments are are
                represented as colors on the map.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapModeSelector;
