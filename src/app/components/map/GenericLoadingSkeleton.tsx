import React from "react";
import PropTypes from "prop-types";
import "./GenericLoadingSkeleton.scss";

const LoadingSkeleton = ({ height = "100px" }) => {
  return (
    <div className="generic-loading-skeleton" style={{ height: height }}></div>
  );
};

LoadingSkeleton.propTypes = {
  size: PropTypes.string,
};

export default LoadingSkeleton;
