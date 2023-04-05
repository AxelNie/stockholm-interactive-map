import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { connectToDb } from "../../../../db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const positions = searchParams.get("positions");

    // If no positions are provided, use a default position
    const defaultPosition = [{ lat: 59.522565, lng: 17.965865 }];

    // Parse the positions and convert them to an array of coordinates
    const coordinatesList = positions
      ? JSON.parse(positions as string).map(
          (coord: { lat: number; lng: number }) => [coord.lng, coord.lat]
        )
      : defaultPosition.map((coord) => [coord.lng, coord.lat]);

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

    return NextResponse.json(
      travelTimes.map((doc) => doc.properties.travelTime)
    );
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
