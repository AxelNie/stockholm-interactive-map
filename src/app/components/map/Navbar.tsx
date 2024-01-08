"use client";
import React from "react";
import "./Navbar.scss";
import Image from "next/image";
import { AiFillInfoCircle } from "react-icons/ai";

interface NavbarProps {
  isMobileDevice: boolean;
}

const Navbar: React.FC<NavbarProps> = ({}) => {
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
      <div className="right">
        <AiFillInfoCircle className="info-icon" />
      </div>
    </div>
  );
};

export default Navbar;
