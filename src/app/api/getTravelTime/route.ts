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

    // Build an array of $geoIntersects conditions for each coordinate
    const geoIntersectsConditions = coordinatesList.map((coordinates: Coordinate) => ({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat],
          },
        },
      },
    }));

    // Execute a single query to find all matching points
    const travelTimesDocs = await collection.find({
      $or: geoIntersectsConditions,
    }).toArray();


    client.close();

    const travelTimes: number[] = travelTimesDocs.map((doc: any) => doc.properties.travelTime);


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

