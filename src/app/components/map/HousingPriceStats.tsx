// HousingPriceStats.tsx
import React, { useEffect, useState } from "react";
import "./HousingPriceStats.scss";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IHousingPriceData {
  monthlyAvg: {
    [key: string]: number;
  };
  overallAvg: number;
}

function extractCity(input: string): string {
  const parts = input.split(",");
  const city = parts[0].trim();
  return city;
}

const HousingPriceStats = ({ locationData }) => {
  const [housingPriceData, setHousingPriceData] =
    useState<IHousingPriceData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log(locationData.legs[0].startPosition.coordinates);
      const city = extractCity(locationData.startAddress);

      const response = await fetch(
        `http://localhost:3000/api/getHousingPricesForArea?location=${locationData.legs[0].startPosition.coordinates}&dim=1000`
      );
      const data = await response.json();

      setHousingPriceData(data);
      console.log(data);
    };

    fetchData();
  }, [locationData]);

  const dataForChart = housingPriceData
    ? Object.entries(housingPriceData.monthlyAvg).map(([month, price]) => ({
        month,
        price,
      }))
    : [];

  return (
    <div className="housing-price-stats">
      {housingPriceData ? (
        <div className="graph">
          <ResponsiveContainer height={200}>
            <LineChart data={dataForChart}>
              <CartesianGrid stroke="#1E232D" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#5ADF92" />
            </LineChart>
          </ResponsiveContainer>
          <div className="average-price">
            <h3>Average Price for the Year: </h3>
            <p>{housingPriceData.overallAvg}</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HousingPriceStats;
