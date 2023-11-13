import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDefaultWeekday(): string {
  const today = new Date();
  let dayOfWeek = today.getDay();

  if (dayOfWeek === 6) {
    today.setDate(today.getDate() + 2);
  } else if (dayOfWeek === 0) {
    today.setDate(today.getDate() + 1);
  }

  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function getTravelTime(
  originCoordinates: [number, number],
  destExtId: number,
  time = "08:00",
  date = getDefaultWeekday()
): Promise<object | { error: string }> {
  const [originLng, originLat] = originCoordinates;

  try {
    const apiUrl = `https://api.sl.se/api2/TravelplannerV3_1/trip.json?key=${process.env.NEXT_PUBLIC_SL_TRAVELPLANNER_API_KEY}&originCoordLat=${originLat}&originCoordLong=${originLng}&destExtId=${destExtId}&date=${date}&time=${time}&poly=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const result = data.Trip[0];

    return result;
  } catch (error: any) {
    console.log("Error getting travel time.");
    console.error(error.message);
    return { error: error.message };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coordinates = searchParams.get("coordinates");

    let time = searchParams.get("time");

    if (!time) {
      time = "08:00";
    }

    if (!coordinates) {
      return new Response(
        JSON.stringify({ error: "Coordinates are required" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    let parsedCoordinates: [number, number] = JSON.parse(coordinates) as [
      number,
      number
    ];

    try {
      parsedCoordinates = JSON.parse(coordinates);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid coordinates format" },
        { status: 400 }
      );
    }

    if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
      return NextResponse.json(
        { error: "Invalid coordinates format" },
        { status: 400 }
      );
    }

    const tCentralenDestId = 9001; // T-Centralen station coordinates

    const travelInfo: any = await getTravelTime(
      parsedCoordinates,
      tCentralenDestId,
      time
    );

    if (typeof travelInfo === "string") {
      return NextResponse.json(
        { error: "Error getting travel information", errorMessage: travelInfo },
        { status: 500 }
      );
    }

    if (!travelInfo) {
      return NextResponse.json(
        { error: "Error getting travel information" },
        { status: 500 }
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

        const polyline = leg.Polyline;

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
          polyline,
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
  } catch (error: any) {
    console.error(error);
    const sanitizedError = new Error("Failed to process the request");
    sanitizedError.name = error.name;
    sanitizedError.message = error.message;
    return NextResponse.json(
      {
        error: sanitizedError,
        errorMessage: error.message,
      },
      { status: 500 }
    );
  }
}

function getTimeDifference(time1: string, time2: string) {
  // Create two temporary Date objects to store the time strings
  const date1: Date = new Date(`1970-01-01T${time1}Z`);
  const date2: Date = new Date(`1970-01-01T${time2}Z`);

  const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());

  // Convert the time difference to seconds
  const diffInSeconds = diffInMilliseconds / 1000;
  const diffInMinutes = diffInSeconds / 60;

  return diffInMinutes;
}

function addMinutesToTimeString(timeString: any, minutesToAdd: any) {
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

function calculateTravelTimeOfLeg(leg: any) {
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
