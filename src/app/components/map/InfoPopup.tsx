import { useEffect, useState } from "react";
import "./InfoPopup.scss";
import TravelTime from "./TravelTime";
import TravelLeg from "./TravelLeg";
import { MdOutlineClose } from "react-icons/md";
import LoadingSkeleton from "./LoadingSkeleton";

interface ILocationData {
  startAddress: string;
  totalTravelTime: string;
  legs: {
    transportType: string;
    travelTime: string;
    startPosition: {
      address: string;
      coordinates: number[];
    };
    endPosition: {
      address: string;
      coordinates: number[];
    };
  }[];
}

function extractCityAndStreet(input: string): [string, string] {
  const parts = input.split(",");
  const street = parts[1].trim();
  const city = parts[0].trim();
  return [city, street];
}

const InfoPopup = ({ coordinates, onClose }) => {
  const [locationData, setLocationData] = useState<ILocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:3000/api/getLocationData?coordinates=${encodeURIComponent(
          JSON.stringify(coordinates)
        )}`
      );
      const data = await response.json();
      console.log(data);

      if (data.errorCode) {
        const errorMessages = {
          "1001": "Key is undefined.",
          "1002": "Key is invalid.",
          "1003": "Invalid API.",
          "1004":
            "This API is currently not available for keys with priority above 2.",
          "1005": "Invalid API for key.",
          "1006": "Too many requests per minute.",
          "1007": "Too many requests per month.",
        };

        const errorMessage = errorMessages[data.errorCode] || "Unknown error.";
        return errorMessage;
      }

      if (data.error) {
        setErrorMessage(data.errorMessage);
      } else {
        setLocationData(data);
      }
    };

    fetchData();
  }, [coordinates]);

  return (
    <div className="info-popup-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {locationData ? (
        <>
          <MdOutlineClose className="close-icon" onClick={onClose} />
          <div className="loaded-content">
            <Header address={locationData.startAddress} />
            <div className="travel-info-container">
              {locationData.legs.map((leg, index) => (
                <>
                  <TravelLeg leg={leg} key={index} onHover={onLegMouseEnter} />
                  {index < locationData.legs.length - 1 && (
                    <TimeBetweenLeg
                      leg={leg}
                      locationData={locationData}
                      index={index}
                    />
                  )}
                </>
              ))}
              <TravelTime time={locationData.totalTravelTime} />
            </div>
          </div>
        </>
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
};

// Header component
const Header = ({ address }) => {
  const [city, street] = extractCityAndStreet(address);
  return (
    <div className="header">
      <h1 className="city">{city}</h1>
      <h4 className="street">{street}</h4>
      <div className="divider" />
    </div>
  );
};

const TimeBetweenLeg = ({ leg, locationData, index }) => {
  // Helper function to calculate time difference
  const calculateTimeDifference = (
    prevTime: string,
    prevTravelTime: string,
    nextTime: string
  ) => {
    const travelTimeInMinutes = parseInt(prevTravelTime.slice(2, -1));
    const prevDate = new Date(`1970-01-01T${prevTime}`);
    const arrivalDate = new Date(
      prevDate.getTime() + travelTimeInMinutes * 60000
    );
    const nextDate = new Date(`1970-01-01T${nextTime}`);
    const diffInMinutes = (nextDate.getTime() - arrivalDate.getTime()) / 60000;

    return diffInMinutes;
  };

  return (
    <>
      <div className="divider-small" />
      <div className="time-between-leg">
        {calculateTimeDifference(
          leg.time,
          leg.travelTime,
          locationData.legs[index + 1].time
        )}{" "}
        min change time
      </div>
      <div className="divider-small" />
    </>
  );
};

export default InfoPopup;
