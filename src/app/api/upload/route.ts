import { connectToDb } from "../../../../db";
import data from "../../../lib/data/travel_distances_grid_geojson_250m_point_small_23_average.json";

export async function GET(request: Request) {
  try {
    //const geoJsonData = convertToGeoJson(data);

    const { client, collection } = await connectToDb("TravelTimesAvg23");
    await collection.deleteMany({});
    //await collection.createIndex({ "location.coordinates": "2dsphere" });
    await collection.insertOne(processTravelData(data));

    client.close();
    return new Response("Data uploaded successfully");
  } catch (error) {
    console.log(error);
    return new Response("Error uploading data");
  }
}

function processTravelData(data: any) {
  const travelTimes = data.averageTravelTimes.map((item: any) =>
    Math.floor(item.averageFastestTime)
  );

  delete data.averageTravelTimes;

  data.travelTimes = travelTimes;

  return data;
}

function convertToGeoJson(data: any[]) {
  return data.map((position) => {
    return {
      name: "Location", // Optional, you can add a name or other identifier if desired
      location: {
        type: "Point",
        coordinates: [position.lng, position.lat],
      },
      travelTime: position.fastestTime,
    };
  });
}
