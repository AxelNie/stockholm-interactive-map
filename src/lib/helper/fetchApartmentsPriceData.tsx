import { getPricesWithLocations } from "@/queries/getAppartmentPrices";

interface ILocation {
  lng: number;
  lat: number;
  fastestTime?: number;
  averagePrice?: number;
}

interface IGridInfo {
  startPoint: { lat: number; lng: number };
  stepSize: { lat: number; lng: number };
  width: number;
  height: number;
}

export async function fetchApartmentsPriceData(
  travelData: ILocation[],
  pricesData: ILocation[]
): Promise<ILocation[]> {
  console.log("function fetchApartmentsPriceData");
  if (pricesData.length === 0) {
    const prices = await getPricesWithLocations();
    const result = mergeTravelTimeWithPrice(
      travelData,
      prices,
      {
        lat: 0.0011304507918993496,
        lng: 0.002246879123034939,
      },
      { height: 454, width: 348 }
    );
    travelData = result;
    return result;
  }
  return pricesData;
}

function mergeTravelTimeWithPrice(
  travelTimes: ILocation[],
  apartmentPrices: ILocation[],
  stepSize: { lat: number; lng: number },
  gridDimensions: { height: number; width: number }
): ILocation[] {
  let added = 0;
  const result: ILocation[] = travelTimes;
  const GridInfo: IGridInfo = {
    startPoint: { lat: 59.659036, lng: 17.579331 },
    stepSize: { lat: 0.0011304507918993496, lng: 0.002246879123034939 },
    width: 348,
    height: 454,
  };

  const latStep = 3 * stepSize.lat;
  const lngStep = 3 * stepSize.lng;

  apartmentPrices.forEach(function (location, i) {
    const index = getCellIndex(location.lng, location.lat, GridInfo);
    const neighbors = getNeighbors(index, gridDimensions);
    const all = [];
    all.push(index);
    all.push(...neighbors);

    all.forEach((neighborIndex) => {
      if (
        isWithinPriceCell(
          travelTimes[neighborIndex],
          location,
          latStep,
          lngStep
        )
      ) {
        result[neighborIndex].averagePrice = location.averagePrice;
        added++;
      }
    });
  });

  console.log("added: ", added);
  return result;
}

function getCellIndex(lng: number, lat: number, gridInfo: IGridInfo): number {
  const col = Math.floor(
    (lng - gridInfo.startPoint.lng) / gridInfo.stepSize.lng
  );
  const row = Math.floor(
    (gridInfo.startPoint.lat - lat) / gridInfo.stepSize.lat
  );

  if (row < 0 || row >= gridInfo.height || col < 0 || col >= gridInfo.width) {
    return -1; // Out of bounds
  }

  return col * gridInfo.height + row;
}

function isWithinPriceCell(
  travelTime: ILocation,
  priceCell: ILocation,
  latStep: number,
  lngStep: number
) {
  if (travelTime?.lat === undefined) {
    console.log("undefined traveltime: ", travelTime);
    return false;
  }

  if (priceCell?.lat === undefined) {
    console.log("undefined pricecell: ", priceCell);
    return false;
  }

  return (
    travelTime.lat <= priceCell.lat + latStep / 2 &&
    travelTime.lat > priceCell.lat - latStep / 2 &&
    travelTime.lng >= priceCell.lng - lngStep / 2 &&
    travelTime.lng < priceCell.lng + lngStep / 2
  );
}

function getNeighbors(
  index: number,
  dimensions: { height: number; width: number }
) {
  const row = Math.floor(index / dimensions.width);
  const col = index % dimensions.width;

  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the current cell

      const neighborRow = row + dy;
      const neighborCol = col + dx;

      if (
        neighborRow >= 0 &&
        neighborRow < dimensions.height &&
        neighborCol >= 0 &&
        neighborCol < dimensions.width
      ) {
        neighbors.push(neighborRow * dimensions.width + neighborCol);
      }
      // Omitting the else block to exclude invalid indices
    }
  }

  return neighbors;
}
