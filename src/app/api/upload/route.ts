import { NextApiRequest, NextApiResponse } from 'next';
import { Collection } from 'mongodb';
import { connectToDb } from '../../../../db';
import data from "@/travel_distances_grid.json";
import { point, polygon } from '@turf/turf';

import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        console.log(data);
        console.log("HEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEJ")
        const geoJsonData = convertToGeoJson(data);
  
        const { client, collection } = await connectToDb();
        await collection.insertOne(geoJsonData);
  
        client.close();
        return new Response('Data uploaded successfully')
      } catch (error) {
        return new Response("Error uploading data")
      }
}

function midpoint(coord1: [number, number], coord2: [number, number]): [number, number] {
    const midLng = (coord1[0] + coord2[0]) / 2;
    const midLat = (coord1[1] + coord2[1]) / 2;
    return [midLng, midLat];
  }


function convertToGeoJson(data: { lat: number; lng: number; fastestTime: number }[], expansionFactor: number = 0.5) {
    const geoJsonFeatures = data.map((entry, index) => {
      const currentCoordinates = [entry.lng, entry.lat];
      const nextCoordinates = index < data.length - 1
        ? [data[index + 1].lng, data[index + 1].lat]
        : [entry.lng, entry.lat];
  
      const midPoint = midpoint(currentCoordinates, nextCoordinates);
      const currentPoint = point(currentCoordinates);
      const midPointObj = point(midPoint);
  
      const bufferedPolygon = polygon(
        midPointObj.geometry.coordinates.map(coords =>
          currentPoint.geometry.coordinates.map(coord => [
            coord[0] + (coords[0] - coord[0]) * expansionFactor,
            coord[1] + (coords[1] - coord[1]) * expansionFactor
          ])
        )
      );
  
      return {
        type: 'Feature',
        geometry: bufferedPolygon.geometry,
        properties: {
          travelTime: entry.fastestTime
        }
      };
    });
  
    return geoJsonFeatures;
  }
  
async function readJsonData(filename : string) {
    const rawData = await fs.promises.readFile('./travel_distances_grid.json', 'utf-8');
    const jsonData = JSON.parse(rawData);
    return jsonData;
}
    
  