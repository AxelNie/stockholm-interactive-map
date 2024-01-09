// Assuming Popup.tsx is in the same directory
import React, { useState } from "react";
import "./Navbar.scss";
import Image from "next/image";
import { AiFillInfoCircle } from "react-icons/ai";
import Popup from "./Popup";
import PopupInfo from "./PopupInfo";

interface NavbarProps {
  isMobileDevice: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isMobileDevice }) => {
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
        <PopupInfo isMobileDevice={isMobileDevice} onClose={() => setIsPopupOpen(false)} />
      </Popup>
    </div>
  );
};

export default Navbar;
