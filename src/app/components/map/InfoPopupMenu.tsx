import React, { useState } from "react";
import "./InfoPopupMenu.scss";

interface Props {
  onToggle: () => void;
  selectedOption: string;
}

const InfoPopupMenu: React.FC<Props> = ({ onToggle, selectedOption }) => {
  const options = ["Travel details", "Housing prices"];

  const handleClick = (option: string) => {
    onToggle();
  };

  return (
    <div className="toggle-button">
      <div className="toggle-line">
        {options.map((option) => (
          <div
            key={option}
            className={`toggle-line-section ${
              option === selectedOption ? "active" : ""
            }`}
          />
        ))}
      </div>
      <div className="info-menu-buttons-container">
        {options.map((option) => (
          <button
            key={option}
            className={`toggle-option ${
              option === selectedOption ? "active" : ""
            }`}
            onClick={() => handleClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InfoPopupMenu;
