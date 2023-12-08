import { getPricesWithLocations } from "@/queries/getAppartmentPrices";

interface ILocation {
  lng: number;
  lat: number;
  fastestTime?: number;
  averagePrice?: number;
}

// worker.ts
addEventListener("message", async (event: MessageEvent) => {
  console.log("worker.ts: addEventListener");
  const locations: ILocation[] = event.data;
  const pricesData = await getPricesWithLocations();
  const result = locations.map((location) => ({
    ...location,
    averagePrice: findClosestPrice(location, pricesData).averagePrice,
  }));

  console.log("done");
  postMessage(result);
});

function findClosestPrice(
  location: ILocation,
  pricesData: ILocation[]
): ILocation {
  let closest = pricesData[0];
  let minDistance = distance(location, closest);

  pricesData.forEach((priceData) => {
    const dist = distance(location, priceData);
    if (dist < minDistance) {
      minDistance = dist;
      closest = priceData;
    }
  });

  return closest;
}

// Calculate the distance between two points (using a simple Euclidean distance for example)
function distance(location1: ILocation, location2: ILocation): number {
  return Math.sqrt(
    Math.pow(location1.lng - location2.lng, 2) +
      Math.pow(location1.lat - location2.lat, 2)
  );
}
