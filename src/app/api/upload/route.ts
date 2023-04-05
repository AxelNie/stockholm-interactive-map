import { NextApiRequest, NextApiResponse } from "next";
import { Collection } from "mongodb";
import { connectToDb } from "../../../../db";
import data from "@/data/travel_distances_grid_geojson_170m.json";

type Coordinate = { lat: number; lng: number };
type GeoTravelTime = {
  0: Coordinate;
  1: Coordinate;
  2: Coordinate;
  3: Coordinate;
  fastestTime: number;
};

export async function GET(request: Request) {
  try {
    const geoJsonData = convertToGeoJson(data);

    const { client, collection } = await connectToDb();
    await collection.insertMany(geoJsonData);

    client.close();
    return new Response("Data uploaded successfully");
  } catch (error) {
    return new Response("Error uploading data");
  }
}

function convertToGeoJson(data: any[]) {
  return data.map((entry) => {
    const coordinates = [
      [entry["0"].lng, entry["0"].lat],
      [entry["1"].lng, entry["1"].lat],
      [entry["2"].lng, entry["2"].lat],
      [entry["3"].lng, entry["3"].lat],
      [entry["0"].lng, entry["0"].lat], // Close the polygon by repeating the first coordinate
    ];

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
      properties: {
        travelTime: entry.fastestTime,
      },
    };
  });
}

function convertToGeoTravelTime(data: any[]): GeoTravelTime[] {
  return data.map((entry) => {
    return {
      0: { lat: entry["0"].lat, lng: entry["0"].lng },
      1: { lat: entry["1"].lat, lng: entry["1"].lng },
      2: { lat: entry["2"].lat, lng: entry["2"].lng },
      3: { lat: entry["3"].lat, lng: entry["3"].lng },
      fastestTime: entry.fastestTime,
    };
  });
}
