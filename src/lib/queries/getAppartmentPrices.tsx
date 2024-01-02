interface ILocation {
  lng: number;
  lat: number;
  averagePrice: number;
}

export async function getPricesWithLocations() {
  const data = {
    startPoint: { lat: 59.659036, lng: 17.579331 },
    endPoint: { lat: 59.145848, lng: 18.360638 },
    stepDegrees: { lat: 0.0011304507918993496, lng: 0.002246879123034939 },
    width: 348,
    height: 454,
  };

  try {
    const apiUrl =
      "https://24yq2sx3n3.execute-api.eu-north-1.amazonaws.com/test/prices";
    const response = await fetch(apiUrl);
    const prices = await response.json();

    return getListOfLocationsWithPrices(prices);
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to retrieve data");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    throw sanitizedError;
  }
}

function getListOfLocationsWithPrices(prices: number[]): ILocation[] {
  const locations: ILocation[] = [];

  for (let i = 0; i < prices.length; i += 3) {
    const averagePrice = prices[i];
    const lat = prices[i + 1];
    const lng = prices[i + 2];

    locations.push({ lng, lat, averagePrice });
  }

  return locations;
}
