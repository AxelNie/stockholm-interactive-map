import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "../../../../db";

export async function GET(req: NextRequest) {
  try {
    let collectionName = "TravelTimesSmall";

    if (req.nextUrl.searchParams.get("include_wait_time") === "true") {
      if (req.nextUrl.searchParams.get("time") === "23") {
        collectionName = "TravelTimesAvg23";
      } else {
        collectionName = "TravelTimesAvg7_8";
      }
    }

    const { client, collection } = await connectToDb(collectionName);

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
