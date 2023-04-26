// OverlayControls.tsx
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

  const limits = [
    greenLimit,
    15 + greenLimit,
    45 + greenLimit,
    45 + greenLimit,
  ];

  const colors = ["#26d926", "#d9d926", "#d99a26", "#d92626"];

  return (
    <div className="overlay-controls">
      <div className="adjust-interval-control">
        <h3 className="title">Adjust interval</h3>
        <hr className="separator" />
        <div className="controls">
          <button className="control-button" onClick={decreaseLimit}>
            -
          </button>
          <div className="interval-limits">
            {limits.map((limit, index) => (
              <div key={index} className="interval-section">
                <div
                  className="color-line"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span>{limit}</span>
              </div>
            ))}
          </div>
          <button className="control-button" onClick={increaseLimit}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayControls;
