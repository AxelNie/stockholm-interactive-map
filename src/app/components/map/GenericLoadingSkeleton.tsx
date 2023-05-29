import React from "react";
import PropTypes from "prop-types";
import "./GenericLoadingSkeleton.scss";

const GenericLoadingSkeleton = ({ height = "100px", width = "100%" }) => {
  return (
    <div
      className="generic-loading-skeleton"
      style={{ height: height, width: width }}
    ></div>
  );
};

GenericLoadingSkeleton.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
};

export default GenericLoadingSkeleton;
