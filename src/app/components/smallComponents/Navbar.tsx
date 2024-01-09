import React, { useState, useEffect } from "react";
import "./Navbar.scss";
import Image from "next/image";
import { AiFillInfoCircle } from "react-icons/ai";
import Popup from "./Popup";
import PopupInfo from "./PopupInfo";

interface NavbarProps {
  isMobileDevice: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isMobileDevice }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  useEffect(() => {
    const hasVisitedAndClosedPopup = localStorage.getItem(
      "hasVisitedAndClosedPopup"
    );
    if (hasVisitedAndClosedPopup) {
      setIsPopupOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isPopupOpen) {
      localStorage.setItem("hasVisitedAndClosedPopup", "true");
    }
  }, [isPopupOpen]);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

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

      <Popup isOpen={isPopupOpen} onClose={() => closePopup()}>
        <PopupInfo
          isMobileDevice={isMobileDevice}
          onClose={() => closePopup()}
        />
      </Popup>
    </div>
  );
};

export default Navbar;
