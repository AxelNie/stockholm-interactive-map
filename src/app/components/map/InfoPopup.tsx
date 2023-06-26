"use client";
import React, { useEffect, useState } from "react";
import "./InfoPopup.scss";
import TripDetails from "./TripDetails";
import HousingPriceStats from "./HousingPriceStats";
import { MdOutlineClose } from "react-icons/md";
import InfoPopupMenu from "./InfoPopupMenu";
import GenericLoadingSkeleton from "./GenericLoadingSkeleton";
import SlideUpComponent from "./SlideUpComponent";
import TravelTime from "./TravelTime";

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
  coordinates: any;
  onClose: () => void;
  onPolylineData: any;
  onLegHover: (id: number, isHovering: boolean) => void;
  hoveredLegId: number | null;
  selectedOption: string;
  onToggle: any;
  housingPriceRadius: number;
  handleSliderChange: any;
  travelTime: number;
  isMobileDevice: boolean;
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
  travelTime,
  isMobileDevice,
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

  // Activate loading skeleton when coordinates change
  useEffect(() => {
    setLocationData(null);
  }, [coordinates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/getLocationData?coordinates=${encodeURIComponent(
            JSON.stringify(coordinates)
          )}&time=${convertToTimeString(travelTime)}`
        );

        const data: any = await response.json();
        setErrorMessage(null);

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

          const errorMessage =
            errorMessages[data.errorCode] || "Unknown error.";
          throw new Error(errorMessage);
        }

        if (data.error) {
          throw new Error(data.errorMessage);
        } else {
          setLocationData(data);
          onPolylineData(extractPolylineData(data));
        }
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message);
      }
    };

    fetchData();
  }, [coordinates, travelTime]);

  return (
    <>
      {isMobileDevice ? (
        <SlideUpComponent
          selectedOption={selectedOption}
          top={
            <Header
              adress={locationData?.startAddress}
              onClose={onClose}
              error={errorMessage}
            />
          }
          middle={
            <>
              <InfoPopupMenu
                selectedOption={selectedOption}
                onToggle={onToggle}
              />
              {selectedOption === "Travel details" ? (
                <TripDetails
                  locationData={locationData}
                  onLegHover={handleLegHover}
                  hoveredLegId={hoveredLegId}
                  isMobileDevice={isMobileDevice}
                />
              ) : (
                <HousingPriceStats
                  coordinates={coordinates}
                  locationData={locationData}
                  housingPriceRadius={housingPriceRadius}
                  handleSliderChange={handleSliderChange}
                  onlyBottom={false}
                  isMobileDevice={isMobileDevice}
                />
              )}
            </>
          }
          bottom={
            selectedOption === "Travel details" ? (
              <TravelTime time={locationData?.totalTravelTime} />
            ) : (
              <HousingPriceStats
                coordinates={coordinates}
                locationData={locationData}
                housingPriceRadius={housingPriceRadius}
                handleSliderChange={handleSliderChange}
                onlyBottom={true}
                isMobileDevice={isMobileDevice}
              />
            )
          }
          onClose={onClose}
        />
      ) : (
        <div className="info-popup-container">
          <div className="loaded-content">
            <Header
              adress={locationData?.startAddress}
              onClose={onClose}
              error={errorMessage}
            />

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
                coordinates={coordinates}
                locationData={locationData}
                housingPriceRadius={housingPriceRadius}
                handleSliderChange={handleSliderChange}
                onlyBottom={false}
                isMobileDevice={isMobileDevice}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

interface HeaderProps {
  adress: string | undefined;
  onClose: () => void;
  error: string | null;
}

const Header: React.FC<HeaderProps> = ({ adress, onClose, error }) => {
  const [city, street] = adress ? extractCityAndStreet(adress) : ["", ""];
  if (error) {
    return (
      <div className="header">
        <div className="text">
          <h1 className="city">Error</h1>
          <h4 className="street">Could not retrieve location</h4>
        </div>
        <MdOutlineClose className="close-icon" onClick={onClose} />
      </div>
    );
  } else {
    return (
      <div className="header">
        <div className="text">
          {adress ? (
            <>
              <h1 className="city">{city}</h1>
              <h4 className="street">{street}</h4>
            </>
          ) : (
            <div className="header-skeleton">
              <GenericLoadingSkeleton height="38px" />
              <GenericLoadingSkeleton height="18px" />
            </div>
          )}
        </div>
        <MdOutlineClose className="close-icon" onClick={onClose} />
      </div>
    );
  }
};

function convertToTimeString(input: number): string {
  // Convert the number to string and pad with leading zeros
  const paddedInput = input.toString().padStart(2, "0");

  // Add ":00" suffix
  const time = `${paddedInput}:00`;

  return time;
}

export default InfoPopup;
