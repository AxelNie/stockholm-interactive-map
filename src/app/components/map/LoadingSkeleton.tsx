import React from "react";
import "./LoadingSkeleton.scss";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="loading-skeleton">
      <div className="header-skeleton"></div>
      <div className="content-skeleton">
        <div className="travel-leg-skeleton"></div>
        <div className="time-between-skeleton"></div>
        <div className="travel-time-skeleton"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
