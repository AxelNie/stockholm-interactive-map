import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "../../../../db";

interface Coordinate {
  lat: number;
  lng: number;
}

export async function GET(req: NextRequest) {
  try {
    const { client, collection } = await connectToDb("TravelTimesSmall");

    const document = await collection.findOne();

    client.close();

    return new NextResponse(JSON.stringify({ document }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to process the request");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    return NextResponse.json({
      error: sanitizedError,
      errorMessage: error.message,
    });
  }
}
