import React, { useState } from "react";
import "./Filter.scss";
import { MdFilterListAlt } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";
import RangeSlider from 'react-range-slider-input';
import "react-range-slider-input/dist/style.css";

interface FilterComponentProps {
  priceState: {
    range: number[];
    active: boolean;
    savedActive: boolean;
    savedRange: number[];
  };
  timeState: {
    range: number[];
    active: boolean;
    savedActive: boolean;
    savedRange: number[];
  };
  setPriceState: React.Dispatch<
    React.SetStateAction<{
      range: number[];
      active: boolean;
      savedActive: boolean;
      savedRange: number[];
    }>
  >;
  setTimeState: React.Dispatch<
    React.SetStateAction<{
      range: number[];
      active: boolean;
      savedActive: boolean;
      savedRange: number[];
    }>
  >;
  minValuePrice: number;
  maxValuePrice: number;
  minValueTime: number;
  maxValueTime: number;
  isMobileDevice: boolean;
  isFilterExpanded: boolean;
  setIsFilterExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  priceState,
  setPriceState,
  timeState,
  setTimeState,
  minValuePrice,
  maxValuePrice,
  minValueTime,
  maxValueTime,
  isMobileDevice,
  isFilterExpanded,
  setIsFilterExpanded,
}) => {
  const [isChanged, setIsChanged] = useState(false);

  const enablePriceFilter = () => {
    setPriceState({ ...priceState, active: true });
    setIsChanged(true);
  }

  const enableTimeFilter = () => {
    setTimeState({ ...timeState, active: true });
    setIsChanged(true);
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceState({ ...priceState, active: e.target.checked });
    setIsChanged(true);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeState({ ...timeState, active: e.target.checked });
    setIsChanged(true);
  };

  const handleRangeChange = (type: 'price' | 'time', values: number[]) => {
    if (type === 'price') {
      setPriceState({ ...priceState, range: values });
      console.log(values);
    } else if (type === 'time') {
      setTimeState({ ...timeState, range: values });
      console.log(values);
    }
    setIsChanged(true);
  };

  const applyFilter = () => {
    setPriceState({
      ...priceState,
      savedActive: priceState.active,
      savedRange: priceState.range,
    });
    setTimeState({
      ...timeState,
      savedActive: timeState.active,
      savedRange: timeState.range,
    });
    setIsFilterExpanded(false);
    setIsChanged(false);
  };

  const onClose = () => {
    setIsFilterExpanded(false);
    setPriceState({
      ...priceState,
      range: priceState.savedRange,
      active: priceState.savedActive,
    });
    setTimeState({
      ...timeState,
      range: timeState.savedRange,
      active: timeState.savedActive,
    });
    setIsChanged(false);
  };

  const getNumberOfFiltersApplied = () => {
    let count = 0;
    if (priceState.active) {
      count++;
    }
    if (timeState.active) {
      count++;
    }
    return count;
  }

  return (
    <div className={isMobileDevice ? "filter-container mobile" : "filter-container"}>
      {(!isFilterExpanded || isMobileDevice) && (
        <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className={isFilterExpanded ? "filter-button active" : "filter-button"}>
          <MdFilterListAlt className="filter-icon" />
          {timeState.active || priceState.active ?
            <div className="circle">{getNumberOfFiltersApplied()}</div>
            : null}
        </button>
      )}
      {isFilterExpanded && (
        <div className="expanded-container">
          <div className="close-container">
            <MdOutlineClose onClick={() => onClose()} className="close-icon" />
          </div>
          <h1>Filters</h1>
          <div className="slider-container">
            <div className="checkbox-container">
              <input
                id="priceCheckbox"
                type="checkbox"
                className="custom-checkbox"
                checked={priceState.active}
                onChange={handlePriceChange}
              />
              <label htmlFor="priceCheckbox">Price Per Square Meter</label>
            </div>

            <div className={priceState.active ? "range-container active" : "range-container"}>
              <p>{priceState.active ? formatNumber(priceState.range[0]) : "-"}</p>
              <RangeSlider
                className="range-slider"
                min={minValuePrice}
                max={maxValuePrice}
                disabled={!priceState.active}
                step={5000}
                value={priceState.range}
                onInput={(values: number[]) => handleRangeChange('price', values)}

              />
              <p>{priceState.active ? formatNumber(priceState.range[1]) : "-"}</p>
              {!priceState.active ?
                <div className="filter-hover-overlay" onClick={() => enablePriceFilter()}>
                  Click to enable filter
                </div>
                : null}
            </div>
          </div>
          <div className="slider-container">
            <div className="checkbox-container">
              <input
                id="timeCheckbox"
                type="checkbox"
                className="custom-checkbox"
                checked={timeState.active}
                onChange={handleTimeChange}

              />
              <label htmlFor="timeCheckbox">Travel Time</label>
            </div>

            <div className={timeState.active ? "range-container active" : "range-container"}>
              <p>{timeState.active ? timeState.range[0] + "m" : "-"}</p>
              <RangeSlider
                className="range-slider"
                min={minValueTime}
                max={maxValueTime}
                disabled={!timeState.active}
                step={5}
                value={timeState.range}
                onInput={(values: number[]) => handleRangeChange('time', values)}
              />
              <p>{timeState.active ? timeState.range[1] + "m" : "-"}</p>
              {!timeState.active ?
                <div className="filter-hover-overlay" onClick={() => enableTimeFilter()}>
                  Click to enable filter
                </div>
                : null}
            </div>
          </div>
          <button className={isChanged ? "apply active" : "apply"} onClick={applyFilter}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;

// Function that take a number and formats it with k instead of 1000
// Example: 1000 -> 1k
const formatNumber = (num: number) => {
  return num >= 1000 ? `${Math.round(num / 1000)}k` : num.toString();
}
