import React from "react";
import "./OverlayControls.scss";

interface OverlayControlsProps {
  greenLimit: number;
  onGreenLimitChange: (newLimit: number) => void;
  isMobileDevice: boolean;
  mapVisualisationMode: any;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  greenLimit,
  onGreenLimitChange,
  isMobileDevice,
  mapVisualisationMode,
}) => {
  const formatNumber = (num: number): string => {
    return num >= 1000 ? `${Math.round(num / 1000)}k` : num.toString();
  };

  const increaseLimit = () => {
    onGreenLimitChange(greenLimit + 5);
  };

  const decreaseLimit = () => {
    if (greenLimit >= 5) {
      onGreenLimitChange(greenLimit - 5);
    }
  };

  let limits = [greenLimit, 15 + greenLimit, 45 + greenLimit];

  if (mapVisualisationMode === "money") {
    limits = [40000, 80000, 120000];
  }

  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  const displayIntervals = [
    `<${formatNumber(limits[0])}`,
    `${formatNumber(limits[0])}-${formatNumber(limits[1])}`,
    `${formatNumber(limits[1])}-${formatNumber(limits[2])}`,
    `>${formatNumber(limits[2])}`,
  ];

  return (
    <div className="overlay-controls">
      {isMobileDevice ? null : (
        <div className="adjust-interval-control">
          <h3 className="title">Adjust time intervals</h3>
          <div className="separator" />
          <div className="controls">
            <div>
              <button
                className="control-button"
                onClick={() => decreaseLimit()}
              >
                -
              </button>
            </div>
            <div className="interval-limits">
              {displayIntervals.map((interval, index) => (
                <div key={index} className="interval-section">
                  <div
                    className="color-line"
                    style={{ backgroundColor: colors[index] }}
                  ></div>
                  {mapVisualisationMode === "money" ?
                    <span>{interval}/m^2</span> :
                    <span>{interval}m</span>
                  }
                </div>
              ))}
            </div>
            <div>
              <button
                className="control-button"
                onClick={() => increaseLimit()}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverlayControls;
