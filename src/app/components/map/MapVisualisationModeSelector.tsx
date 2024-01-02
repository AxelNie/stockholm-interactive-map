import React, { useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import "./MapVisualisationModeSelector.scss";
import { RiQuestionFill } from "react-icons/ri/";
import Tooltip from "./Tooltip";

interface MapVisualisationModeSelector {
  mapVisualisationMode: string;
  setMapVisualisationMode: React.Dispatch<React.SetStateAction<string>>;
  isMobileDevice: boolean;
}

const MapVisualisationModeSelector: React.FC<MapVisualisationModeSelector> = ({
  mapVisualisationMode,
  setMapVisualisationMode,
  isMobileDevice,
}) => {
  const handleClick = (mode: string) => {
    setMapVisualisationMode(mode);
  };

  return (
    <div className="map-visualisation-mode-selector-container">
      {isMobileDevice ? null : (
        <div className="selector-container">
          <div className="time-selector-container">
            <p>Select mode</p>
            <div className="button-container">
              <button
                className={
                  mapVisualisationMode === "time"
                    ? "time-button-active"
                    : "time-button"
                }
                onClick={() => handleClick("time")}
              >
                Time
              </button>
              <button
                className={
                  mapVisualisationMode === "money"
                    ? "time-button-active"
                    : "time-button"
                }
                onClick={() => handleClick("money")}
              >
                Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualisationModeSelector;
