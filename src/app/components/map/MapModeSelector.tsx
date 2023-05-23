// MapModeSelector.tsx
import React, { useState, useCallback } from "react";
import "./MapModeSelector.scss";

type MapMode = "light" | "dark";

interface MapModeSelectorProps {
  onChange: (mode: MapMode) => void;
}

const MapModeSelector: React.FC<MapModeSelectorProps> = ({ onChange }) => {
  const [currentMode, setCurrentMode] = useState<MapMode>("light");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const mapModes: Array<{ mode: MapMode; imgSrc: string; label: string }> = [
    {
      mode: "light",
      imgSrc: "/light.jpg",
      label: "Light Mode",
    },
    {
      mode: "dark",
      imgSrc: "/dark.jpg",
      label: "Dark Mode",
    },
  ];

  const handleMouseEnter = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleModeChange = useCallback(
    (mode: MapMode) => {
      setCurrentMode(mode);
      setIsMenuOpen(false);
      onChange(mode);
    },
    [onChange]
  );

  return (
    <div className="map-mode-selector-wrapper">
      <div
        className="map-mode-selector"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="current-mode">
          <img
            src={mapModes.find((m) => m.mode === currentMode)?.imgSrc}
            alt="Current mode"
          />
          <div className="label-mode-selector">
            {isMenuOpen ? currentMode : "Mode"}
          </div>
        </div>
        {isMenuOpen && (
          <div className="menu">
            {mapModes.map((mapMode) => (
              <div
                key={mapMode.mode}
                className="menu-item"
                onClick={() => handleModeChange(mapMode.mode)}
              >
                <img src={mapMode.imgSrc} alt={mapMode.label} />
                <div className="label">{mapMode.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModeSelector;
