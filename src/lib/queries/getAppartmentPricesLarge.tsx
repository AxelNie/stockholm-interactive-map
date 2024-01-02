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

    return getListOfLocationsWithPrices(prices, data);
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to retrieve data");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    throw sanitizedError;
  }
}

function getListOfLocationsWithPrices(
  prices: number[],
  data: {
    startPoint: { lat: number; lng: number };
    endPoint: { lat: number; lng: number };
    stepDegrees: { lat: number; lng: number };
    width: number;
    height: number;
  }
): ILocation[] {
  const locations: ILocation[] = [];
  let index_slot = 0;

  for (
    let y = data.startPoint.lng;
    y < data.endPoint.lng;
    y += data.stepDegrees.lng * 3 // Skip by 3 columns for each iteration
  ) {
    for (
      let x = data.startPoint.lat;
      x > data.endPoint.lat;
      x -= data.stepDegrees.lat * 3 // Skip by 3 rows for each iteration
    ) {
      // Ensure we don't go beyond the array length
      if (index_slot < prices.length) {
        const averagePrice = prices[index_slot];

        // Add the same average price for each of the 9 points in the 3x3 grid
        for (let dx = 0; dx < 3; dx++) {
          for (let dy = 0; dy < 3; dy++) {
            const adjustedLat = x - data.stepDegrees.lat * dx;
            const adjustedLng = y + data.stepDegrees.lng * dy;

            locations.push({
              lng: adjustedLng,
              lat: adjustedLat,
              averagePrice,
            });
          }
        }
      }
      index_slot++;
    }
  }

  return locations;
}
