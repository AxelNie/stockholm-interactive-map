interface ILocation {
  lng: number;
  lat: number;
  fastestTime: number;
}

export async function getTravelTime() {
  try {
    const apiUrl = "api/getAllTravelTimes";
    const response = await fetch(apiUrl);
    const data = await response.json();

    const listOfTravelTimes = getListOfLocationTravelTimes(data.document);

    return listOfTravelTimes;
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to retrieve data");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    throw sanitizedError;
  }
}

function getListOfLocationTravelTimes(data: {
  _id: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  stepDegrees: { lat: number; lng: number };
  width: number;
  height: number;
  travelTimes: number[];
}): ILocation[] {
  const locations: ILocation[] = [];

  let index_slot = 0;

  for (
    let y = data.startPoint.lng;
    y < data.endPoint.lng;
    y += data.stepDegrees.lng
  ) {
    for (
      let x = data.startPoint.lat;
      x > data.endPoint.lat;
      x -= data.stepDegrees.lat
    ) {
      index_slot += 1;
      const index = y * data.width + x;

      const fastestTime = data.travelTimes[index_slot];

      let lng = y;
      let lat = x;

      locations.push({ lng, lat, fastestTime });
    }
  }

  return locations;
}
