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
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    console.log("Updated green limit:", newValue);
    onGreenLimitChange(newValue); // Add this line to update the value
  };

  return (
    <div className="overlay-controls">
      <div className="overlay-color-slider">
        <label htmlFor="green-limit-slider">
          Set green limit: {greenLimit} min
        </label>
        <input
          type="range"
          id="green-limit-slider"
          min="0"
          max="60"
          step="1"
          value={greenLimit}
          onChange={handleSliderChange}
        />
      </div>
    </div>
  );
};

export default OverlayControls;
