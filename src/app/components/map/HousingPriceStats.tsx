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
import Slider from "@mui/material/Slider";

interface IHousingPriceData {
  monthlyAvg: {
    [key: string]: number;
  };
  overallAvg: number;
  sufficientMonthlyData: boolean;
}

function extractCity(input: string): string {
  const parts = input.split(",");
  const city = parts[0].trim();
  return city;
}

const HousingPriceStats = ({
  locationData,
  housingPriceRadius,
  handleSliderChange,
}) => {
  const [housingPriceData, setHousingPriceData] =
    useState<IHousingPriceData | null>(null);
  const [displayRadius, setDisplayRadius] = useState(housingPriceRadius);

  useEffect(() => {
    const fetchData = async () => {
      setHousingPriceData(null);
      console.log(locationData.legs[0].startPosition.coordinates);
      const city = extractCity(locationData.startAddress);

      const response = await fetch(
        `http://localhost:3000/api/getHousingPricesForArea?location=${locationData.legs[0].startPosition.coordinates}&dim=${housingPriceRadius}`
      );
      const data = await response.json();

      setHousingPriceData(data);
      console.log(data);
    };

    fetchData();
  }, [locationData, housingPriceRadius]);

  const dataForChart = housingPriceData
    ? Object.entries(housingPriceData.monthlyAvg).map(([month, price]) => ({
        month,
        price,
      }))
    : [];

  return (
    <div className="housing-price-stats">
      {housingPriceData ? (
        <div className="loaded-content-wrapper">
          <div className="graph">
            <p className="description-graph">Price for appartments</p>
            {housingPriceData.sufficientMonthlyData ? (
              <>
                <ResponsiveContainer height={200}>
                  <LineChart data={dataForChart} margin={{ right: 30 }}>
                    <CartesianGrid stroke="#1E232D" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatXAxis}
                      minTickGap={15}
                      stroke="#59606E"
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      width={45}
                      color="#5ADF92"
                      stroke="#59606E"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#5ADF92"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <Slider
                  value={displayRadius}
                  min={200}
                  max={2000}
                  step={100}
                  onChange={(event, newValue) => setDisplayRadius(newValue)}
                  onChangeCommitted={handleSliderChange}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                />
              </>
            ) : (
              <p>Not enough monthly data for this area</p>
            )}
          </div>
          <div className="avg-price-container">
            <div className="avg-price-bg">
              <div className="avg-price">
                <p className="avg-price-label">Average price for one year: </p>
                <p className="price-per-sqrmeter">{`${formatPriceWithSpaces(
                  housingPriceData.overallAvg
                )} kr/kvm`}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="loading-pricing-stats-for-area">Loading...</p>
      )}
    </div>
  );
};

export default HousingPriceStats;

// Months mapping array
const MONTHS = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

// Custom function for formatting the y-axis
const formatYAxis = (tickItem) => {
  return `${tickItem / 1000}k`;
};

// Custom function for formatting the x-axis
const formatXAxis = (tickItem) => {
  const date = new Date(tickItem);
  return `${MONTHS[date.getMonth()]}-${date
    .getFullYear()
    .toString()
    .slice(-2)} `;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Month: ${formatXAxis(label)}`}</p>
        <p className="intro">{`Price: ${formatPriceWithSpaces(
          payload[0].value
        )} kr/kvm`}</p>
      </div>
    );
  }

  return null;
};

function formatPriceWithSpaces(number: number): string {
  if (number) {
    const numberString = number.toString();
    const reversedNumberString = numberString.split("").reverse().join("");
    const formattedNumberArray: string[] = [];

    for (let i = 0; i < reversedNumberString.length; i += 3) {
      const segment = reversedNumberString.substr(i, 3);
      formattedNumberArray.push(segment);
    }

    const formattedNumber = formattedNumberArray.join(" ");
    return formattedNumber.split("").reverse().join("");
  } else {
    return "-";
  }
}
