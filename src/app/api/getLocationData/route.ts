import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
//import fetch from "node-fetch";

type LocationData = {
  address: string;
  travelInfo: object;
};

async function reverseGeocode(coordinates: [number, number]): Promise<string> {
  const [lng, lat] = coordinates;

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features.length > 0) {
      const location = data.features[0].place_name;
      return location;
    } else {
      return "Location not found";
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Error reverse geocoding";
  }
}

async function getTravelTime(
  originCoordinates: [number, number],
  destExtId: number,
  date = "2023-04-24",
  time = "08:00"
): Promise<object> {
  const [originLng, originLat] = originCoordinates;

  try {
    const apiUrl = `https://api.sl.se/api2/TravelplannerV3_1/trip.json?key=${process.env.NEXT_PUBLIC_SL_TRAVELPLANNER_API_KEY}&originCoordLat=${originLat}&originCoordLong=${originLng}&destExtId=${destExtId}&date=${date}&time=${time}&poly=1`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Return the travel information
    return data.Trip[0];
  } catch (error) {
    console.log("Error getting travel time.");
    console.error(error.message);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const coordinates = req.nextUrl.searchParams.get("coordinates");

    if (!coordinates) {
      return NextResponse.json({ error: "Coordinates are required" }, 400);
    }

    let parsedCoordinates;

    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (error) {
      return NextResponse.json({ error: "Invalid coordinates format" }, 400);
    }

    if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
      return NextResponse.json({ error: "Invalid coordinates format" }, 400);
    }

    const tCentralenDestId = "9001"; // T-Centralen station coordinates

    const travelInfo = await getTravelTime(parsedCoordinates, tCentralenDestId);

    if (!travelInfo) {
      return NextResponse.json(
        { error: "Error getting travel information" },
        500
      );
    }

    const startAddress = travelInfo.LegList.Leg[0].Origin.name;
    const legs = travelInfo.LegList.Leg.filter((leg: any) => !leg.hide).map(
      (leg: any) => {
        let transportType;
        if (leg.category != null) {
          transportType = leg.category;
        } else {
          transportType = leg.type;
        }

        var travelTime;
        if (leg.duration) {
          travelTime = leg.duration;
        } else {
          travelTime = calculateTravelTimeOfLeg(leg);
        }

        const startPosition = {
          coordinates: [leg.Origin.lon, leg.Origin.lat],
          address: leg.Origin.name,
        };
        const endPosition = {
          coordinates: [leg.Destination.lon, leg.Destination.lat],
          address: leg.Destination.name,
        };
        const date = leg.Origin.date;
        const time = leg.Origin.time;

        return {
          transportType,
          travelTime,
          startPosition,
          endPosition,
          date,
          time,
        };
      }
    );

    const walkTimeToFirstStation = getTimeDifference(
      legs[1].time,
      legs[0].time
    );

    const totalTravelTime = addMinutesToTimeString(
      travelInfo.duration,
      walkTimeToFirstStation
    );

    const responseData = {
      startAddress,
      legs,
      totalTravelTime,
    };

    return new NextResponse(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    const sanitizedError = new Error("Failed to process the request");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    return NextResponse.json(
      {
        error: sanitizedError,
        errorMessage: error.message,
      },
      500
    );
  }
}

function getTimeDifference(time1, time2) {
  // Create two temporary Date objects to store the time strings
  const date1 = new Date(`1970-01-01T${time1}Z`);
  const date2 = new Date(`1970-01-01T${time2}Z`);

  // Calculate the time difference in milliseconds
  const diffInMilliseconds = Math.abs(date1 - date2);

  // Convert the time difference to seconds
  const diffInSeconds = diffInMilliseconds / 1000;
  const diffInMinutes = diffInSeconds / 60;

  return diffInMinutes;
}

function addMinutesToTimeString(timeString, minutesToAdd) {
  // Extract hours and minutes from the time string
  const [, hours = 0, , minutes = 0] = timeString.match(
    /PT((\d+)?H)?((\d+)?M)?/
  );

  // Calculate total minutes and add the desired minutes
  const totalMinutes =
    parseInt(hours || 0) * 60 + parseInt(minutes || 0) + minutesToAdd;

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  if (newHours === 0) {
    return `PT${newMinutes}M`;
  } else {
    return `PT${newHours}H${newMinutes}M`;
  }
}

function calculateTravelTimeOfLeg(leg) {
  const departureDateTime = new Date(`${leg.Origin.date}T${leg.Origin.time}`);
  const arrivalDateTime = new Date(
    `${leg.Destination.date}T${leg.Destination.time}`
  );

  const timeDifference =
    arrivalDateTime.getTime() - departureDateTime.getTime();
  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let travelTime = "PT";
  if (hours > 0) {
    travelTime += `${hours}H`;
  }
  travelTime += `${remainingMinutes}M`;

  return travelTime;
}
