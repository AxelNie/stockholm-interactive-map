import { NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import { connectToDb } from "../../../../db";

interface ICoordinate {
  lat: number;
  lng: number;
}

type ApartmentData = {
  livingArea: number;
  rooms: number;
  soldDate: string;
  soldPrice: number;
  objectType: string;
};

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get("location");
  const sizeOfArea = req.nextUrl.searchParams.get("dim");

  if (!location) {
    return new Response(JSON.stringify({ error: "Location is required" }), {
      status: 400,
    });
  }

  const coordinates: ICoordinate = {
    lat: parseFloat(location.split(",")[0]),
    lng: parseFloat(location.split(",")[1]),
  };

  console.log(coordinates);

  try {
    const housingPriceData = await fetchDataForCoordinate(
      coordinates,
      sizeOfArea
    );

    return new Response(
      JSON.stringify(getMonthlyAveragePrices(housingPriceData)),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      { status: 500 }
    );
  }
}

function getMonthlyAveragePrices(data: ApartmentData[]) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let totalSum = 0;
  let totalCount = 0;

  const monthlyData = data
    .filter((item) => {
      const soldDate = new Date(item.soldDate);
      return (
        item.objectType === "Lägenhet" &&
        item.livingArea > 0 &&
        soldDate >= oneYearAgo
      );
    })
    .map((item) => ({
      ...item,
      soldDate: item.soldDate.slice(0, 7), // Strip to YYYY-MM
      pricePerSquareMeter: item.soldPrice / item.livingArea,
    }));

  const monthlyAvg: Record<string, number> = {};

  monthlyData.forEach((item) => {
    if (!monthlyAvg[item.soldDate]) {
      monthlyAvg[item.soldDate] = {
        total: 0,
        count: 0,
      };
    }

    monthlyAvg[item.soldDate].total += item.pricePerSquareMeter;
    monthlyAvg[item.soldDate].count++;

    totalSum += item.pricePerSquareMeter;
    totalCount++;
  });

  // Compute averages
  Object.keys(monthlyAvg).forEach((key) => {
    if (monthlyAvg[key].count === 0) {
    }
    monthlyAvg[key] = Math.round(monthlyAvg[key].total / monthlyAvg[key].count);
  });

  const overallAvg = Math.round(totalSum / totalCount);

  // Reverse the order of monthlyAvg
  const monthlyAvgCorrectOrder = {};
  Object.keys(monthlyAvg)
    .reverse()
    .forEach((key) => {
      monthlyAvgCorrectOrder[key] = monthlyAvg[key];
    });

  let sufficientMonthlyData = true;
  console.log(monthlyAvg);
  console.log(Object.keys(monthlyAvg).length);
  if (Object.keys(monthlyAvg).length < 10) {
    sufficientMonthlyData = false;
  }

  return {
    monthlyAvg: monthlyAvgCorrectOrder,
    overallAvg,
    sufficientMonthlyData,
  };
}

async function fetchDataForCoordinate(
  coordinates: ICoordinate,
  sizeOfArea: number
) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const unique = crypto.randomBytes(16).toString("hex");

  const toHash =
    process.env.NEXT_PUBLIC_BOOLI_PUBLIC_KEY +
    timestamp +
    process.env.NEXT_PUBLIC_BOOLI_PRIVATE_KEY +
    unique;
  const hashed = crypto.createHash("sha1").update(toHash).digest("hex");

  let offset = 0;
  let shouldContinue = true;

  const allData = [];

  const max_iterations = 5;
  let iterations = 0;
  while (shouldContinue && iterations < max_iterations) {
    iterations++;
    const url = `https://api.booli.se/sold?center=${coordinates.lng},${coordinates.lat}&dim=${sizeOfArea},${sizeOfArea}&objectType=lägenhet&offset=${offset}&limit=500&callerId=${process.env.NEXT_PUBLIC_BOOLI_PUBLIC_KEY}&time=${timestamp}&unique=${unique}&hash=${hashed}&
    `;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.sold.length > 0) {
        allData.push(
          ...data.sold.map((item: any) => ({
            livingArea: item.livingArea,
            rooms: item.rooms,
            soldDate: item.soldDate,
            listPrice: item.listPrice,
            soldPrice: item.soldPrice,
            objectType: item.objectType,
          }))
        );

        if (
          new Date(data.sold[data.sold.length - 1].soldDate) >
          new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        ) {
          shouldContinue = false;
        }

        offset += 500;
      }
    } catch (error: any) {
      console.error(
        `Failed to fetch data for ${coordinates.lat},${coordinates.lng}`,
        error
      );
      shouldContinue = false;
    }
  }

  return allData;
}
