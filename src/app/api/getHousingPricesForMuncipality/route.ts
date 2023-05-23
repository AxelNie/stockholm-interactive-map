import { NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import { connectToDb } from "../../../../db";

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get("location");

  if (!location) {
    return new Response(JSON.stringify({ error: "Location is required" }), {
      status: 400,
    });
  }

  try {
    let { client, collection } = await connectToDb("HousingPrices");

    const housingPriceData = await collection.findOne({
      municipality: { $regex: new RegExp(`^${location}$`, "i") },
    });

    if (!housingPriceData) {
      return new Response(
        JSON.stringify({
          error: "No data found for the provided location",
        }),
        { status: 404 }
      );
    }

    const { monthlyAvg, overallAvg } = getMonthlyAveragePrices(
      housingPriceData.monthlyData
    );

    client.close();
    return new Response(JSON.stringify({ monthlyAvg, overallAvg }), {
      status: 200,
    });
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

function getMonthlyAveragePrices(data: any) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let totalSum = 0;
  let totalCount = 0;

  const monthlyAvg = Object.keys(data)
    .sort((a, b) => b.localeCompare(a))
    .reduce((result: any, key: string) => {
      const apartmentsData = data[key].filter((item: any) => {
        const soldDate = new Date(item.soldDate);
        return (
          item.objectType === "Lägenhet" &&
          parseInt(item.livingArea) > 0 &&
          soldDate >= oneYearAgo
        );
      });

      if (apartmentsData.length > 0) {
        const monthTotal = apartmentsData.reduce((sum: number, item: any) => {
          const pricePerSquareMeter =
            parseInt(item.soldPrice) / parseInt(item.livingArea);
          totalSum += pricePerSquareMeter;
          totalCount++;
          return sum + pricePerSquareMeter;
        }, 0);

        result[key] = monthTotal / apartmentsData.length;
      }

      return result;
    }, {});

  const overallAvg = totalSum / totalCount;

  return { monthlyAvg, overallAvg };
}
