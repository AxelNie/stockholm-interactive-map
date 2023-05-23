import React, { useState } from "react";
import "./InfoPopupMenu.scss";

interface Props {
  options: string[];
  onToggle: (selectedOption: string) => void;
}

const InfoPopupMenu: React.FC<Props> = ({ options, onToggle }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleClick = (option: string) => {
    setSelectedOption(option);
    onToggle(option);
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
