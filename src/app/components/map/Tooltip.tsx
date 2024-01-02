import React, { useState, useRef } from "react";
import "./Tooltip.scss";

interface TooltipProps {
  children: React.ReactNode;
  title: React.ReactNode;
  position?: 'top' | 'bottom'; // Optional prop to specify the position
}

const Tooltip: React.FC<TooltipProps> = ({ children, title, position = "bottom" }) => {
  const [tooltipDisplay, setTooltipDisplay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    setTooltipDisplay(true);
  };

  const hideTooltip = () => {
    setTooltipDisplay(false);
  };

  return (
    <div
      className={`tooltip-container ${tooltipDisplay ? "active" : ""}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      ref={containerRef}
    >
      {children}
      {tooltipDisplay && (
        <div className={`tooltip-text ${position}`}>{title}</div>
      )}
    </div>
  );
};

export default Tooltip;
