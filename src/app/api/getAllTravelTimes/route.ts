import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "../../../../db";
import NodeCache from "node-cache";
const myCache = new NodeCache({ stdTTL: 3600 });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    let collectionName = "TravelTimesSmall";
    const { searchParams } = new URL(request.url);

    if (searchParams.get("include_wait_time") === "true") {
      collectionName =
        searchParams.get("time") === "23"
          ? "TravelTimesAvg23"
          : "TravelTimesAvg7_8";
    }

    // Kontrollera om datat finns i cachen
    const cachedData = myCache.get(collectionName);
    if (cachedData) {
      return new Response(JSON.stringify({ document: cachedData }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Hämta data från databasen
    const document = await fetchDataFromDatabase(collectionName);

    // Spara data i cachen
    myCache.set(collectionName, document);

    // Skicka svaret
    return new Response(JSON.stringify({ document }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400",
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

async function fetchDataFromDatabase(collectionName: string) {
  try {
    // Anslut till databasen
    const { client, collection } = await connectToDb(collectionName);

    // Hämta dokumentet
    const document = await collection.findOne();

    // Stäng databasanslutningen
    client.close();

    // Returnera det hämtade dokumentet
    return document;
  } catch (error) {
    // Hantera eventuella fel
    console.error("Error fetching data from database:", error);
    throw error; // Skicka felet vidare för att hantera det i GET-funktionen
  }
}
