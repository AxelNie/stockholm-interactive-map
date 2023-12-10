import React, { useState } from "react";
import "./Filter.scss";
import { IoFilter } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

interface IGridInfo {
  startPoint: { lat: number; lng: number };
  stepSize: { lat: number; lng: number };
  width: number;
  height: number;
}

interface ILocation {
  lat: number;
  lng: number;
  fastestTime?: number;
  averagePrice?: number;
}

const FilterComponent: React.FC = () => {
  // Price
  const [isExpanded, setIsExpanded] = useState(false);
  const [rangePrice, setRangePrice] = useState([10000, 120000]);
  const [rangePriceActive, setRangePriceActive] = useState(false);
  const [rangePriceSaved, setRangePriceSaved] = useState(false);
  const [rangeSavedPrice, setRangeSavedPrice] = useState([10000, 120000]);
  const minValuePrice = 10000;
  const maxValuePrice = 120000;

  // Time
  const minValueTime = 0;
  const maxValueTime = 90;
  const [rangeTime, setRangeTime] = useState([minValueTime, maxValueTime]);
  const [rangeTimeActive, setRangeTimeActive] = useState(false);
  const [rangeTimeSaved, setRangeTimeSaved] = useState(false);
  const [rangeSavedTime, setRangeSavedTime] = useState([
    minValueTime,
    maxValueTime,
  ]);

  const applyFilter = () => {
    console.log(
      `Filter applied with price range: ${rangePrice[0]} - ${rangePrice[1]}`
    );
    console.log(
      `Filter applied with time range: ${rangeTime[0]} - ${rangeTime[1]}`
    );
    setRangeSavedPrice(rangePrice);
    setRangeSavedTime(rangeTime);
    setRangePriceSaved(rangePriceActive);
    setRangeTimeSaved(rangeTimeActive);
    setIsExpanded(false);
  };

  const onClose = () => {
    setIsExpanded(false);
    setRangePrice(rangeSavedPrice);
    setRangeTime(rangeSavedTime);
    setRangePriceActive(rangePriceSaved);
    setRangeTimeActive(rangeTimeSaved);
  };

  return (
    <div className="filter-container">
      {!isExpanded && (
        <button onClick={() => setIsExpanded(!isExpanded)}>
          <IoFilter className="icon" />
        </button>
      )}
      {isExpanded && (
        <div className="expanded-container">
          <div className="close-container">
            <MdOutlineClose onClick={() => onClose()} />
          </div>
          <div className="slider-container">
            <div className="checkbox-container">
              <input
                id="priceCheckbox"
                type="checkbox"
                className="custom-checkbox"
                checked={rangePriceActive}
                onChange={(e) => setRangePriceActive(e.target.checked)}
              />
              <label htmlFor="priceCheckbox">Select price interval</label>
            </div>

            <div className="range-container">
              <p>{rangePrice[0]}</p>
              <RangeSlider
                className="range-slider"
                min={minValuePrice}
                max={maxValuePrice}
                disabled={!rangePriceActive}
                step={5000}
                value={rangePrice}
                onInput={(values: number[]) => setRangePrice(values)}
              />
              <p>{rangePrice[1]}</p>
            </div>
          </div>
          <div className="slider-container">
            <div className="checkbox-container">
              <input
                id="timeCheckbox"
                type="checkbox"
                className="custom-checkbox"
                checked={rangeTimeActive}
                onChange={(e) => setRangeTimeActive(e.target.checked)}
              />
              <label htmlFor="timeCheckbox">Select time interval</label>
            </div>

            <div className="range-container">
              <p>{rangeTime[0]}</p>
              <RangeSlider
                className="range-slider"
                min={minValueTime}
                max={maxValueTime}
                disabled={!rangeTimeActive}
                step={5}
                value={rangeTime}
                onInput={(values: number[]) => setRangeTime(values)}
              />
              <p>{rangeTime[1]}</p>
            </div>
          </div>
          <button onClick={applyFilter}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
