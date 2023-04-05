// pages/api/uploadGeoJson.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Collection } from 'mongodb';
import { connectToDb } from '../../../../db'
import fs from 'fs';
import path from 'path';

function convertToGeoJson(data: { lat: number; lng: number; fastestTime: number }) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [data.lng, data.lat]
    },
    properties: {
      travelTime: data.fastestTime
    }
  };
}

async function readJsonData(filename : string) {
    const dataPath = path.join(process.cwd(), filename);
    const rawData = await fs.promises.readFile(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData);
    return jsonData;
}
  
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const data = await readJsonData("travel_distances_grid.json");
      const geoJsonData = convertToGeoJson(data);

      const { client, collection } = await connectToDb();
      await collection.insertOne(geoJsonData);

      client.close();
      res.status(201).json({ message: 'Data uploaded successfully', data: geoJsonData });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading data', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
