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

export async function GET(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data);

    // If no positions are provided, use a default position
    const defaultPosition = [{ lat: 59.522565, lng: 17.965865 }];

    // Convert the positions to an array of coordinates
    const coordinatesList = data.map((coord: { lat: number; lng: number }) => [
      coord.lng,
      coord.lat,
    ]);

    const { client, collection } = await connectToDb();

    // Execute a $geoWithin query for each coordinate and retrieve the travel times
    const travelTimesPromises = coordinatesList.map((coordinates) =>
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
  } catch (error) {}
}
