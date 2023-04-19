import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "../../../../db";

interface Coordinate {
  lat: number;
  lng: number;
}

interface PositionsRequest {
  positions: Coordinate[];
}

interface TravelTimeResponse {
  travelTimes: number[];
}

async function findClosestLocation(coordinate: Coordinate, collection: any) {
  const query = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [coordinate.lng, coordinate.lat] },
        distanceField: "distance",
        spherical: true,
        num: 1,
      },
    },
  ];

  const result = await collection.aggregate(query).toArray();
  return result[0];
}

export async function POST(req: NextRequest) {
  try {
    const data: PositionsRequest = await req.json();

    // If no positions are provided, use a default position
    const defaultPosition: Coordinate[] = [{ lat: 59.522565, lng: 17.965865 }];

    // Make sure the 'positions' property exists in the data object and is an array
    if (!Array.isArray(data.positions)) {
      data.positions = defaultPosition;
    }

    // Convert the positions to an array of coordinates
    const coordinatesList: Coordinate[] = data.positions;

    const { client, collection } = await connectToDb();

    // Find the closest location for each coordinate
    const closestLocationsPromises = coordinatesList.map((coordinate) =>
      findClosestLocation(coordinate, collection)
    );
    const closestLocations = await Promise.all(closestLocationsPromises);

    client.close();

    const travelTimes: number[] = closestLocations.map(
      (location: any) => location.properties.travelTime
    );

    return NextResponse.json({
      travelTimes,
    });
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to process the request");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    return NextResponse.json({
      error: sanitizedError,
    });
  }
}
