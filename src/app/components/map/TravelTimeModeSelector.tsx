import React, { useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import "./TravelTimeModeSelector.scss";
import { RiQuestionFill } from "react-icons/ri/";
import Tooltip from "./Tooltip";

interface TravelTimeModeSelectorProps {
  travelTimeMode: string;
  setTravelTimeMode: React.Dispatch<React.SetStateAction<string>>;
  travelTime: number;
  setTravelTime: React.Dispatch<React.SetStateAction<number>>;
}

const TravelTimeModeSelector: React.FC<TravelTimeModeSelectorProps> = ({
  travelTimeMode,
  setTravelTimeMode,
  travelTime,
  setTravelTime,
}) => {
  const handleModeChange = (event: any) => {
    setTravelTimeMode(event.target.value as string);
  };
  useEffect(() => {
    setTravelTime(travelTimeMode === "direct" ? 7 : 23);
  }, [travelTimeMode]);

  const handleTimeChange = (time: number) => {
    setTravelTime(time);
  };

  const text: any = () => {
    return (
      <div className="text-container">
        <h2>Travel time visualization mode</h2>
        <p>
          The selected mode adjusts how the travel times, represented by the
          map&apos;s color overlay, are calculated.
        </p>
        <h3>Direct Travel Time</h3>
        <p>
          Displays the direct commuting time excluding any waiting time. This
          represents the duration of the journey itself, from the moment you
          board your transport to the moment you arrive at Stockholm
          city/T-centralen.
        </p>
        <h3>Average travel time including wait</h3>
        <p>
          Displays the average commuting time, including waiting time, between
          two specified hours. This represents the expected total time it would
          take to reach central Stockholm within this period. For example, if
          the metro departs from a station every 30 minutes and takes 10 minutes
          to reach Stockholm city/T-centralen, the average commute time will be
          25 minutes (15 minutes average wait time + 10 minutes actual travel
          time).
        </p>
      </div>
    );
  };

  return (
    <div className="full-site-width">
      <div className="selector-container">
        <div className="dropdown-container">
          <div className="travel-time-mode-label-container">
            <p>Travel time visualization mode</p>
            <Tooltip title={text()}>
              <div>
                <RiQuestionFill className="help-icon" />
              </div>
            </Tooltip>
          </div>
          <Select
            value={travelTimeMode}
            onChange={handleModeChange}
            className="custom-select"
            MenuProps={{
              PaperProps: {
                style: {
                  backgroundColor: "#1E232D",
                  color: "white",
                  width: "200px",
                  maxHeight: "300px",
                },
              },
              classes: {
                list: "custom-list",
              },
            }}
          >
            <MenuItem value="direct">Direct travel time</MenuItem>
            <MenuItem value="avg_include_wait">
              Avg. travel time incl. wait
            </MenuItem>
          </Select>
        </div>
        <div className="time-selector-container">
          <p>Time</p>
          <div className="button-container">
            <button
              className={
                travelTime === 7 ? "time-button-active" : "time-button"
              }
              disabled={travelTimeMode === "avg_include_wait"}
              onClick={() => handleTimeChange(7)}
            >
              {travelTimeMode === "direct" ? "7:00" : "7:00-8:00"}
            </button>
            <button
              className={
                travelTime === 23 ? "time-button-active" : "time-button"
              }
              disabled={travelTimeMode === "direct"}
              onClick={() => handleTimeChange(23)}
            >
              {travelTimeMode === "direct" ? "23:00" : "23:00-00:00"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelTimeModeSelector;
