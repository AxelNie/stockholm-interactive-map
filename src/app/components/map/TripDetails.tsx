"use client";
import React from "react";
import TravelLeg from "./TravelLeg";
import TravelTime from "./TravelTime";
import GenericLoadingSkeleton from "./GenericLoadingSkeleton";
import { TbClockFilled } from "react-icons/tb";

const TripDetails = ({ locationData, onLegHover, hoveredLegId }: any) => {
  const handleLegHover = (id: number, isHovering: boolean) => {
    onLegHover(id, isHovering); // Call the onLegHover prop directly
  };

  return (
    <>
      <div className="travel-legs scrollable">
        {locationData ? (
          <>
            <div className="start-time-text-container">
              <div className="start-time-text">
                <TbClockFilled className="icon" />{" "}
                <p>{locationData.legs[0].time.substring(0, 5)}</p>
              </div>
            </div>
            {locationData.legs.map((leg: any, index: number) => (
              <React.Fragment key={index}>
                <TravelLeg
                  leg={leg}
                  key={index + "l"}
                  id={index}
                  onHover={handleLegHover}
                  hoveredLegId={hoveredLegId}
                />
                {index < locationData.legs.length - 1 && (
                  <TimeBetweenLeg
                    leg={leg}
                    locationData={locationData}
                    index={index}
                    key={index + "t"}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            <div className="trip-details-loading-skeleton">
              <GenericLoadingSkeleton height="20px" width="80%" />
              <GenericLoadingSkeleton height="70px" width="40%" />
              <GenericLoadingSkeleton height="20px" width="65%" />
            </div>
            <div className="trip-details-loading-skeleton">
              <GenericLoadingSkeleton height="20px" width="80%" />
              <GenericLoadingSkeleton height="70px" width="40%" />
              <GenericLoadingSkeleton height="20px" width="65%" />
            </div>
          </>
        )}
      </div>
      <TravelTime time={locationData?.totalTravelTime} />
    </>
  );
};

export default TripDetails;

const TimeBetweenLeg = ({ leg, locationData, index }: any) => {
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
    let nextDate = new Date(`1970-01-01T${nextTime}`);

    // If nextTime is before the arrival time, add 24 hours to the nextDate
    if (nextDate.getTime() < arrivalDate.getTime()) {
      nextDate = new Date(nextDate.getTime() + 24 * 60 * 60000);
    }

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
