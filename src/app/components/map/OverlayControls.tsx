"use client";
import React from "react";
import "./OverlayControls.scss";

interface OverlayControlsProps {
  greenLimit: number;
  onGreenLimitChange: (newLimit: number) => void;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  greenLimit,
  onGreenLimitChange,
}) => {
  const increaseLimit = () => {
    onGreenLimitChange(greenLimit + 5);
  };

  const decreaseLimit = () => {
    if (greenLimit >= 5) {
      onGreenLimitChange(greenLimit - 5);
    }
  };

  const limits = [greenLimit, 15 + greenLimit, 45 + greenLimit];

  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  const displayIntervals = [
    `<${limits[0]}`,
    `${limits[0]}-${limits[1]}`,
    `${limits[1]}-${limits[2]}`,
    `>${limits[2]}`,
  ];

  return (
    <div className="overlay-controls">
      <div className="adjust-interval-control">
        <h3 className="title">Adjust time intervals</h3>
        <div className="separator" />
        <div className="controls">
          <div>
            <button className="control-button" onClick={() => decreaseLimit()}>
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
                <span>{interval}m</span>
              </div>
            ))}
          </div>
          <div>
            <button className="control-button" onClick={() => increaseLimit()}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayControls;
