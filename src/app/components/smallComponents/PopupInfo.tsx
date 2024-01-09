import React, { ReactNode, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdTravelExplore } from "react-icons/md";
import "./PopupInfo.scss";

interface PopupInfo {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const pages = [
  {
    topTitle: "Restidkollen",
    title: "Navigate Stockholm with Commute Times and Housing Prices",
    text: "Explore Stockholm with Restidkollen, a unique web app offering insights into commute times and housing prices across the city. Find your ideal area with customizable filters for travel time and price per square meter.",
  },
  {
    topTitle: "Commute",
    title: "Visualize Commute Times",
    text: "View commute times to central Stockholm visually with our color-coded map. Green to red hues indicate travel times, simplifying your understanding of the city's transport network.",
  },
  {
    topTitle: "Prices",
    title: "Housing Price Insights",
    text: "Access up-to-date housing price data for various Stockholm areas. Our app integrates the latest apartment sales information, displaying historical price trends for informed decisions.",
  },
  {
    topTitle: "Customize",
    title: "Tailor Your Search",
    text: "Customize your search with our flexible filters. Set your budget and desired commute time to identify areas that suit your specific preferences and needs in Stockholm.",
  },
  {
    topTitle: "Start",
    title: "Begin Your Exploration",
    text: "Ready to explore? Start using the interactive map now to discover Stockholm's neighborhoods and find the perfect area that aligns with your lifestyle and preferences.",
  },
];

const PopupInfo = ({
  onClose,
  isMobileDevice,
}: {
  onClose: () => void;
  isMobileDevice: boolean;
}) => {
  // Generate the gradient
  const [page, setPage] = useState(0);
  const [lastPageOnMobile, setLastPageOnMobile] = useState<boolean>(
    isMobileDevice && page == pages.length - 1
  );
  const startColor = "rgba(15, 19, 25, 1)"; // Black with full opacity
  const endColor = "rgba(57, 131, 88, 0)"; // Green with 0 opacity
  const gradientSteps = 10;
  const gradientArray = interpolateColor(startColor, endColor, gradientSteps);

  // Convert the gradient array into a CSS linear-gradient string
  const gradientString = `linear-gradient(to right, ${gradientArray.join(
    ", "
  )})`;

  const increasePage = () => {
    console.log(page);
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  const decreasePage = () => {
    console.log(page);
    if (page > 0) {
      setPage(page - 1);
    }
  };

  useEffect(() => {
    console.log("ismobiledevice", isMobileDevice);
    console.log("page", page);
    console.log(
      "lastpageonmobile",
      isMobileDevice && page === pages.length - 1
    );
    setLastPageOnMobile(isMobileDevice && page === pages.length - 1);
  }, [page, isMobileDevice]);

  return (
    <div className="custom-popup-wrapper">
      <div className="image-container"></div>
      <div className="gradient-overlay" style={{ background: gradientString }}>
        <div className="text-container">
          <h2 className="popup-text">{pages[page].topTitle}</h2>
          <h1 className="popup-text">{pages[page].title}</h1>
          <p>{pages[page].text}</p>
        </div>
        <div className="progress-indicator-wrapper">
          <ProgressIndicator currentPage={page} totalPages={pages.length} />
        </div>
      </div>
      <div className="popup-background"></div>
      <div className="bottom-content">
        {!lastPageOnMobile ? (
          <div className="info-about-website">
            <p>Created by Axel Nielsen</p>
          </div>
        ) : null}
        <div
          className={
            lastPageOnMobile ? "button-container fullwidth" : "button-container"
          }
        >
          {page > 0 ? (
            <button
              onClick={() => decreasePage()}
              className="popup-button prev"
            >
              <FaChevronLeft />
              {isMobileDevice ? "" : "Previous"}
            </button>
          ) : null}
          {page < pages.length - 1 ? (
            <button
              onClick={() => increasePage()}
              className="popup-button next"
            >
              Next <FaChevronRight />{" "}
            </button>
          ) : (
            <button onClick={() => onClose()} className="popup-button final">
              Start exploring! <MdTravelExplore />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupInfo;

function interpolateColor(
  color1: string,
  color2: string,
  steps: number
): string[] {
  const match1 = color1.match(/\d+/g);
  const match2 = color2.match(/\d+/g);

  if (!match1 || !match2) {
    throw new Error("Invalid color format");
  }

  const [r1, g1, b1, a1] = match1.map(Number);
  const [r2, g2, b2, a2] = match2.map(Number);

  function lerp(
    start: number,
    end: number,
    step: number,
    totalSteps: number
  ): number {
    return ((end - start) * step) / totalSteps + start;
  }

  const gradient: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const r = Math.round(lerp(r1, r2, i, steps));
    const g = Math.round(lerp(g1, g2, i, steps));
    const b = Math.round(lerp(b1, b2, i, steps));
    const a = lerp(a1, a2, i, steps).toFixed(2);
    gradient.push(`rgba(${r}, ${g}, ${b}, ${a})`);
  }

  return gradient;
}

const ProgressIndicator = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => {
  return (
    <div className="progress-indicator">
      {Array.from({ length: totalPages }, (_, index) => (
        <span
          key={index}
          className={`indicator-circle ${
            index === currentPage ? "active" : ""
          }`}
        />
      ))}
    </div>
  );
};
