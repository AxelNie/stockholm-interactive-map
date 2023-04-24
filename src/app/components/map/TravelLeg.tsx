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
    case "SHP":
      return <MdDirectionsBoat />;
    case "MET":
      return <MdDirectionsSubwayFilled />;
    case "TRN":
      return <MdDirectionsSubwayFilled />;
    case "TRM":
      return <MdTram />;
    default:
      return null;
  }
}

function getString(transportType: string) {
  switch (transportType) {
    case "BUS":
      return "Buss";
    case "WALK":
      return "Promenad";
    case "SHP":
      return "Båt";
    case "MET":
      return "Tunnelbana";
    case "TRN":
      return "Pendeltåg";
    case "TRM":
      return "Spårvagn";
    default:
      return null;
  }
}

const TravelLeg = ({ leg }) => {
  console.log("leg:", leg);
  return (
    <div className="travel-leg-container">
      <h4 className="travel-leg-location">{leg.startPosition.address}</h4>
      <div className="transport-type-and-time">
        <div className="line" />
        <div className="content">
          <div className="icon">{renderIcon(leg.transportType)}</div>
          <div className="leg-info-text">
            <p>{formatTime(leg.travelTime)}</p>
            <p className="travel-type-text">{getString(leg.transportType)}</p>
          </div>
        </div>
      </div>

      <h4 className="travel-leg-location">{leg.endPosition.address}</h4>
    </div>
  );
};

export default TravelLeg;
