"use client";
import "./TravelTime.scss";
import GenericLoadingSkeleton from "./GenericLoadingSkeleton";
interface ITravelTimeProps {
  time: string | null;
}

function convertTimeFormat(timeString: unknown): string {
  if (typeof timeString !== "string") {
    throw new Error("Input must be a string");
  }

  let hours = 0;
  let minutes = 0;
  let timeIndex = 2;

  if (timeString.indexOf("H") !== -1) {
    // extract hours from timeString
    hours = parseInt(timeString.substring(2, timeString.indexOf("H")));
    timeIndex = timeString.indexOf("H") + 1;
  }

  if (timeString.indexOf("M", timeIndex) !== -1) {
    // extract minutes from timeString
    minutes = parseInt(
      timeString.substring(timeIndex, timeString.indexOf("M", timeIndex))
    );
  }

  // format hours and minutes as 2-digit numbers with leading zeros
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}h:${formattedMinutes}m`;
}

const TravelTime = ({ time }: ITravelTimeProps) => {
  console.log(time);
  return (
    <div className="travel-time-container">
      {time ? (
        <div className="travel-time-background">
          <div className="travel-time">
            <div className="label">Travel time</div>
            <div className="time">{convertTimeFormat(time)}</div>
          </div>
        </div>
      ) : (
        <div className="travel-time-background">
          <GenericLoadingSkeleton height="79px" />
        </div>
      )}
    </div>
  );
};

export default TravelTime;
