import "./TravelLeg.scss";

function formatTime(input: string): string {
  const hoursMatch = input.match(/(\d+)H/);
  const minutesMatch = input.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}min`;
  }

  return formattedTime;
}

const TravelLeg = ({ leg }) => {
  console.log("leg:", leg);
  return (
    <div className="travel-leg-container">
      <h4 className="travel-leg-location">{leg.startPosition.address}</h4>
      <p>{formatTime(leg.travelTime)}</p>
    </div>
  );
};

export default TravelLeg;
