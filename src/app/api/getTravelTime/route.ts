import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "../../../../db";

interface Position {
  lat: number;
  lng: number;
}

interface PositionsRequest {
  positions: Position[];
}

interface TravelTimeResponse {
  travelTimes: number[];
}

interface coordinate{
  lat: number;
  lng: number;
}



export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data);

    // If no positions are provided, use a default position
    const defaultPosition = [{ lat: 59.522565, lng: 17.965865 }];

    // Make sure the 'positions' property exists in the data object and is an array
    if (!Array.isArray(data.positions)) {
      data.positions = defaultPosition;
    }

    // Convert the positions to an array of coordinates
    const coordinatesList = data.positions.map((coord: coordinate) => [
      coord.lng,
      coord.lat,
    ]);

    const { client, collection } = await connectToDb();

    // Execute a $geoWithin query for each coordinate and retrieve the travel times
    const travelTimesPromises = coordinatesList.map((coordinates : coordinate[]) =>
      collection.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates,
            },
          },
        },
      })
    );

    const travelTimes = await Promise.all(travelTimesPromises);

    client.close();

    return NextResponse.json({
      travelTimes: travelTimes.map((doc) => doc.properties.travelTime),
    });
  } catch (error : any) {
    console.error(error);
    const sanitizedError = new Error("Failed to process the request");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    return NextResponse.json({
      error: sanitizedError
    });

  }
}
