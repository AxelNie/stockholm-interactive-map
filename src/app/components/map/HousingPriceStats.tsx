"use client";
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
import Box from "@mui/material/Box";
import { MdError } from "react-icons/md";
import GenericLoadingSkeleton from "./GenericLoadingSkeleton";

interface IHousingPriceData {
  monthlyAvg: {
    [key: string]: number;
  };
  overallAvg: number;
  sufficientMonthlyData: boolean;
}

type LocationDataType = {
  startAddress: string;
  legs: any[];
  totalTravelTime: string;
};

type SliderChangeEvent = (
  event: React.SyntheticEvent | Event,
  value: number | number[]
) => void;

interface IProps {
  locationData: LocationDataType | null;
  housingPriceRadius: number;
  handleSliderChange: SliderChangeEvent;
}

const HousingPriceStats: React.FC<IProps> = ({
  locationData,
  housingPriceRadius,
  handleSliderChange,
}) => {
  const [housingPriceData, setHousingPriceData] =
    useState<IHousingPriceData | null>(null);
  const [displayRadius, setDisplayRadius] =
    useState<number>(housingPriceRadius);

  useEffect(() => {
    const fetchData = async () => {
      setHousingPriceData(null);

      const response = await fetch(
        `/api/getHousingPricesForArea?location=${locationData?.legs[0].startPosition.coordinates}&dim=${housingPriceRadius}`
      );
      const data = await response.json();

      setHousingPriceData(data);
    };

    if (locationData) {
      fetchData();
    }
  }, [locationData, housingPriceRadius]);

  const dataForChart = housingPriceData
    ? Object.entries(housingPriceData.monthlyAvg)
        .map(([month, price]) => ({
          month,
          price,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        )
    : [];

  return (
    <div className="housing-price-stats">
      <div className="loaded-content-wrapper">
        <div className="graph">
          <p className="description-graph">Price for appartments</p>
          {housingPriceData ? (
            <>
              {housingPriceData?.sufficientMonthlyData ? (
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
              ) : (
                <div className="error-graph-message">
                  <MdError className="error-icon" />
                  <p>
                    Not enough monthly data for this area, try selecting larger
                    area
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="loading-graph">
              <GenericLoadingSkeleton height="200px" />
            </div>
          )}
          <div className="slider-container">
            <p className="slider-title">Set area size</p>
            <div className="slider-component">
              <Slider
                value={displayRadius}
                min={200}
                max={2000}
                step={100}
                onChange={(event, newValue) => {
                  if (typeof newValue === "number") {
                    setDisplayRadius(newValue);
                  }
                }}
                onChangeCommitted={handleSliderChange}
                aria-labelledby="range-slider"
                sx={{
                  color: "#5ADF92",
                  "& .MuiSlider-thumb": {
                    "&:hover, &.Mui-focusVisible": {
                      boxShadow: "0 0 0 0.4rem rgba(90, 223, 146, 0.1)",
                    },
                  },
                }}
              />
              <Box className="slider-value-box" sx={{ ml: 2 }}>
                {displayRadius}m
              </Box>
            </div>
          </div>
        </div>
        <div className="avg-price-container">
          {housingPriceData ? (
            <div className="avg-price-bg">
              <div className="avg-price">
                <p className="avg-price-label">Average price for one year: </p>

                <p className="price-per-sqrmeter">
                  {`${formatPriceWithSpaces(
                    housingPriceData?.overallAvg
                  )} kr/kvm`}
                </p>
              </div>
            </div>
          ) : (
            <div className="loading-avg-price-bg">
              <GenericLoadingSkeleton height="79px" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HousingPriceStats;

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

const formatYAxis = (tickItem: string) => {
  return `${parseInt(tickItem) / 1000}k`;
};

const formatXAxis = (tickItem: string) => {
  const date = new Date(tickItem);
  return `${MONTHS[date.getMonth()]}-${date
    .getFullYear()
    .toString()
    .slice(-2)} `;
};

const CustomTooltip = ({ active, payload, label }: any) => {
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
