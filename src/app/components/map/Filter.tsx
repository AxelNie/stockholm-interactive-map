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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    setIsExpanded(false);
  };

  const onClose = () => {
    setIsExpanded(false);
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
                checked={priceState.active}
                onChange={(e) =>
                  setPriceState({ ...priceState, active: e.target.checked })
                }
              />
              <label htmlFor="priceCheckbox">Select price interval</label>
            </div>

            <div className="range-container">
              <p>{priceState.range[0]}</p>
              <RangeSlider
                className="range-slider"
                min={minValuePrice}
                max={maxValuePrice}
                disabled={!priceState.active}
                step={5000}
                value={priceState.range}
                onInput={(values: number[]) =>
                  setPriceState({ ...priceState, range: values })
                }
              />
              <p>{priceState.range[1]}</p>
            </div>
          </div>
          <div className="slider-container">
            <div className="checkbox-container">
              <input
                id="timeCheckbox"
                type="checkbox"
                className="custom-checkbox"
                checked={timeState.active}
                onChange={(e) =>
                  setTimeState({ ...timeState, active: e.target.checked })
                }
              />
              <label htmlFor="timeCheckbox">Select time interval</label>
            </div>

            <div className="range-container">
              <p>{timeState.range[0]}</p>
              <RangeSlider
                className="range-slider"
                min={minValueTime}
                max={maxValueTime}
                disabled={!timeState.active}
                step={5}
                value={timeState.range}
                onInput={(values: number[]) =>
                  setTimeState({ ...timeState, range: values })
                }
              />
              <p>{timeState.range[1]}</p>
            </div>
          </div>
          <button onClick={applyFilter}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
