wsdimport { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDb } from "../../../../db";

const publicKey = process.env.NEXT_PUBLIC_BOOLI_PUBLIC_KEY;
const privateKey = process.env.NEXT_PUBLIC_BOOLI_PRIVATE_KEY;

const municipalities = [
  "Botkyrka",
  "Danderyd",
  "Ekerö",
  "Haninge",
  "Huddinge",
  "Järfälla",
  "Lidingö",
  "Nacka",
  "Norrtälje",
  "Nynäshamn",
  "Salem",
  "Sigtuna",
  "Sollentuna",
  "Solna",
  "Stockholm",
  "Sundbyberg",
  "Södertälje",
  "Tyresö",
  "Täby",
  "Upplands-Bro",
  "Upplands Väsby",
  "Vallentuna",
  "Vaxholm",
  "Värmdö",
  "Österåker",
];

async function fetchDataForMunicipality(municipality: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const unique = crypto.randomBytes(16).toString("hex");

  const toHash = publicKey + timestamp + privateKey + unique;
  const hashed = crypto.createHash("sha1").update(toHash).digest("hex");

  let offset = 0;
  let shouldContinue = true;

  const allData = [];

  while (shouldContinue) {
    const url = `https://api.booli.se/sold?q=${municipality}&offset=${offset}&limit=500&callerId=${publicKey}&time=${timestamp}&unique=${unique}&hash=${hashed}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (
        data.sold.length > 0 &&
        new Date(data.sold[data.sold.length - 1].soldDate) >
          new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      ) {
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

        offset += 500;
      } else {
        shouldContinue = false;
      }
    } catch (error: any) {
      console.error(`Failed to fetch data for ${municipality}`, error);
      shouldContinue = false;
    }
  }

  return allData;
}

export async function GET(req: NextRequest) {
  const { client, collection } = await connectToDb("HousingPrices");

  for (const municipality of municipalities) {
    const data = await fetchDataForMunicipality(municipality);

    const monthlyData = data.reduce((acc: any, curr: any) => {
      const soldDate = new Date(curr.soldDate);
      const month = soldDate.getMonth() + 1;
      const year = soldDate.getFullYear();

      if (!acc[`${year}-${month}`]) {
        acc[`${year}-${month}`] = [];
      }

      acc[`${year}-${month}`].push(curr);

      return acc;
    }, {});

    const sortedMonthlyData = Object.keys(monthlyData).reduce(
      (acc: any, key: any) => {
        acc[key] = monthlyData[key].sort(
          (a: any, b: any) =>
            new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()
        );

        return acc;
      },
      {}
    );

    try {
      await collection.updateOne(
        { municipality },
        { $set: { monthlyData: sortedMonthlyData } },
        { upsert: true }
      );
    } catch (error: any) {
      console.error(`Failed to save data for ${municipality}`, error);
    }
  }

  return new NextResponse("Data fetched and saved");
}
