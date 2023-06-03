import React from "react";
import MoonLoader from "react-spinners/MoonLoader";
import "./LoadingOverlay.scss";
import { BsCheck2 } from "react-icons/bs";
import Image from "next/image";

interface IProps {
  status: {
    mapLoaded: boolean;
    travelDistancesLoaded: boolean;
    complete: boolean;
  };
}

const LoadingOverlay: React.FC<IProps> = ({ status }) => (
  <div className="loading-overlay">
    <div className="content-container">
      <Image
        src="/Rrestidkollen.svg"
        alt="Restidkollen logo"
        width={100}
        height={100}
      />
      <h1 className="title">Restidkollen</h1>

      <ul>
        <li>
          <i className="loading-checkmark-container">
            {status.mapLoaded ? (
              <BsCheck2 className="loading-checkmark" />
            ) : (
              <MoonLoader size={15} color="#59606E" />
            )}
          </i>
          <p
            className={status.mapLoaded ? "loading-text-done" : "loading-text"}
          >
            Loading map
          </p>
        </li>
        <li>
          <i className="loading-checkmark-container">
            {status.travelDistancesLoaded ? (
              <BsCheck2 className="loading-checkmark" />
            ) : (
              <MoonLoader size={15} color="#59606E" />
            )}
          </i>
          <p
            className={
              status.travelDistancesLoaded
                ? "loading-text-done"
                : "loading-text"
            }
          >
            Loading travel distances
          </p>
        </li>
      </ul>
    </div>
  </div>
);

export default LoadingOverlay;
