import { useEffect, useState } from "react";
import "./InfoPopup.scss";
import TravelTime from "./TravelTime";
import TravelLeg from "./TravelLeg";

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
      {locationData && (
        <div className="travel-info-container">
          <h3>{locationData.startAddress}</h3>
          <h4>Travel information</h4>
          <p>Total travel time: {locationData.totalTravelTime}</p>
          {locationData.legs.map((leg, index) => (
            <TravelLeg leg={leg} key={index} />
          ))}
          <TravelTime time={locationData.totalTravelTime} />
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InfoPopup;
