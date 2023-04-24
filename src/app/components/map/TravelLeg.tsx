import "./TravelLeg.scss";

import {
  MdDirectionsBus,
  MdDirectionsWalk,
  MdDirectionsBoat,
  MdDirectionsSubwayFilled,
  MdTram,
} from "react-icons/md";

function formatTime(input: string): string {
  const hoursMatch = input.match(/(\d+)H/);
  const minutesMatch = input.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours} h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes} min`;
  }

  return formattedTime;
}

//Render correct icon based on travel type, eg. walk, bus, train etc..
function renderIcon(transportType: string) {
  switch (transportType) {
    case "BUS":
      return <MdDirectionsBus />;
    case "WALK":
      return <MdDirectionsWalk />;
    case "BOAT":
      return <MdDirectionsBoat />;
    case "MET":
      return <MdDirectionsSubwayFilled />;
    case "TRAM":
      return <MdTram />;
    default:
      return null;
  }
}

const TravelLeg = ({ leg }) => {
  console.log("leg:", leg);
  return (
    <div className="travel-leg-container">
      <div className="line" />
      <div className="content">
        <h4 className="travel-leg-location">{leg.startPosition.address}</h4>
        <div className="transport-type-and-time">
          <div className="icon">{renderIcon(leg.transportType)}</div>
          <p>{formatTime(leg.travelTime)}</p>
        </div>

        <h4 className="travel-leg-location">{leg.endPosition.address}</h4>
      </div>
    </div>
  );
};

export default TravelLeg;
