// Assuming Popup.tsx is in the same directory
import React, { useState } from "react";
import "./Navbar.scss";
import Image from "next/image";
import { AiFillInfoCircle } from "react-icons/ai";
import Popup from "../smallComponents/Popup";

interface NavbarProps {
  isMobileDevice: boolean;
}

const CustomPopup = ({ onClose }: { onClose: () => void }) => {
  // Generate the gradient
  const startColor = "rgba(0, 0, 0, 1)"; // Black with full opacity
  const endColor = "rgba(57, 131, 88, 0)"; // Green with 0 opacity
  const gradientSteps = 10;
  const gradientArray = interpolateColor(startColor, endColor, gradientSteps);

  // Convert the gradient array into a CSS linear-gradient string
  const gradientString = `linear-gradient(to right, ${gradientArray.join(
    ", "
  )})`;

  return (
    <div className="custom-popup-wrapper">
      <div className="image-container"></div>
      <div className="gradient-overlay" style={{ background: gradientString }}>
        <div className="text-container">
          <h2 className="popup-text">Restidkollen</h2>
          <h1 className="popup-text">
            Navigate Stockholm with Commute Times and Housing Prices
          </h1>
          <p>
            Explore Stockholm with Restidkollen, a unique web app offering
            insights into commute times and housing prices across the city. Find
            your ideal area with customizable filters for travel time and price
            per square meter.
          </p>
        </div>
      </div>
      <div className="popup-background" />
    </div>
  );
};

const Navbar: React.FC<NavbarProps> = ({}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  return (
    <div className="navbar-container">
      <div className="left">
        <Image
          className="navbar-logo"
          src="/restidkollen_green.svg"
          alt="logo"
          width={27}
          height={27}
        />
        <div className="navbar-title">
          <h1>Restidkollen</h1>
        </div>
      </div>
      <div className="right" onClick={togglePopup}>
        <h2 className="navbar-text">About</h2>
        <AiFillInfoCircle className="info-icon" />
      </div>

      <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <CustomPopup onClose={() => setIsPopupOpen(false)} />
      </Popup>
    </div>
  );
};

export default Navbar;

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
