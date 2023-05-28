"use client";
import React, { useEffect, useState, useRef } from "react";
import "./InfoPopup.scss";
import TripDetails from "./TripDetails";
import HousingPriceStats from "./HousingPriceStats";
import { MdOutlineClose } from "react-icons/md";
import InfoPopupMenu from "./InfoPopupMenu";
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

interface InfoPopupProps {
  coordinates: any; // Define the appropriate type here
  onClose: () => void;
  onPolylineData: any; // Define the appropriate type here
  onLegHover: (id: number, isHovering: boolean) => void;
  hoveredLegId: number | null;
  selectedOption: string;
  onToggle: any; // Define the appropriate type here
  housingPriceRadius: number;
  handleSliderChange: any; // Define the appropriate type here
}

function extractCityAndStreet(input: string): [string, string] {
  const parts = input.split(",");
  const street = parts[1].trim();
  const city = parts[0].trim();
  return [city, street];
}

const InfoPopup: React.FC<InfoPopupProps> = ({
  coordinates,
  onClose,
  onPolylineData,
  onLegHover,
  hoveredLegId,
  selectedOption,
  onToggle,
  housingPriceRadius,
  handleSliderChange,
}) => {
  const [locationData, setLocationData] = useState<ILocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLegHover = (id: number, isHovering: boolean) => {
    onLegHover(id, isHovering);
  };

  const extractPolylineData = (data: any) => {
    const polylineData: any = [];

    data.legs.forEach((leg: any) => {
      if (leg.polyline) {
        polylineData.push(leg.polyline.crd);
      } else {
        polylineData.push([
          leg.startPosition.coordinates,
          leg.endPosition.coordinates,
        ]);
      }
    });

    return polylineData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://www.restidkollen.se/api/getLocationData?coordinates=${encodeURIComponent(
          JSON.stringify(coordinates)
        )}`
      );
      const data: any = await response.json();

      if (data.errorCode) {
        const errorMessages: any = {
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
        onPolylineData(extractPolylineData(data));
      }
    };

    fetchData();
  }, [coordinates]);

  return (
    <div className="info-popup-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {locationData ? (
        <>
          <div className="loaded-content">
            <Header address={locationData.startAddress} onClose={onClose} />
            <InfoPopupMenu
              selectedOption={selectedOption}
              onToggle={onToggle}
            />
            {selectedOption === "Travel details" ? (
              <TripDetails
                locationData={locationData}
                onLegHover={handleLegHover}
                hoveredLegId={hoveredLegId}
              />
            ) : (
              <HousingPriceStats
                locationData={locationData}
                housingPriceRadius={housingPriceRadius}
                handleSliderChange={handleSliderChange}
              />
            )}
          </div>
        </>
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
};

interface HeaderProps {
  address: string;
  onClose: () => void;
}

const Header: React.FC<HeaderProps> = ({ address, onClose }) => {
  const [city, street] = extractCityAndStreet(address);
  return (
    <div className="header">
      <div className="text">
        <h1 className="city">{city}</h1>
        <h4 className="street">{street}</h4>
      </div>
      <MdOutlineClose className="close-icon" onClick={onClose} />
    </div>
  );
};

export default InfoPopup;
