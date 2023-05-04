import { connectToDb } from "../../../../db";
import data from "../../../lib/data/travel_distances_grid_geojson_250m_point_small.json";

export async function GET(request: Request) {
  try {
    //const geoJsonData = convertToGeoJson(data);

    const { client, collection } = await connectToDb("TravelTimesSmall");
    await collection.deleteMany({});
    //await collection.createIndex({ "location.coordinates": "2dsphere" });
    await collection.insertOne(data);

    client.close();
    return new Response("Data uploaded successfully");
  } catch (error) {
    return new Response("Error uploading data");
  }
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
