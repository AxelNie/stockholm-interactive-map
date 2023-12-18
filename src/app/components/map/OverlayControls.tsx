import React, { useEffect } from "react";
import "./OverlayControls.scss";
import { FiPlus, FiMinus } from "react-icons/fi";

interface OverlayControlsProps {
  limits: number[];
  setLimits: (newLimit: number[]) => void;
  isMobileDevice: boolean;
  mapVisualisationMode: any;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  limits,
  setLimits,
  isMobileDevice,
  mapVisualisationMode,
}) => {
  const [step, setStep] = React.useState<number>(5);

  const formatNumber = (num: number): string => {
    return num >= 1000 ? `${Math.round(num / 1000)}k` : num.toString();
  };

  const increaseLimit = () => {
    const updatedLimits = limits.map((number: number) => number + step);
    setLimits(updatedLimits);
  };

  const decreaseLimit = () => {
    if (mapVisualisationMode === "money") {
      if (limits[0] > 10000) {
        const updatedLimits = limits.map((number: number) => number - step);
        setLimits(updatedLimits);
      }
    }

    else if (mapVisualisationMode === "time") {
      if (limits[0] > 5) {
        const updatedLimits = limits.map((number: number) => number - step);
        setLimits(updatedLimits);
      }
    }

  };

  useEffect(() => {
    if (mapVisualisationMode === "money") {
      setLimits([40000, 80000, 120000])
      setStep(10000);
    }
    if (mapVisualisationMode === "time") {
      console.log("setting price 1")
      setLimits([15, 30, 60])
      setStep(5);
    }
  }, [mapVisualisationMode]);

  const colors = ["#13C81A", "#C2D018", "#D1741F", "#BE3A1D"];

  const displayIntervals = [
    `<${formatNumber(limits[0])}`,
    `${formatNumber(limits[0])}-${formatNumber(limits[1])}`,
    `${formatNumber(limits[1])}-${formatNumber(limits[2])}`,
    `>${formatNumber(limits[2])}`,
  ];

  return (
    <div className={isMobileDevice ? "overlay-controls mobile" : "overlay-controls"}>
      <div className="adjust-interval-control">
        <h3 className="title">Adjust time intervals</h3>
        <div className="separator" />
        <div className="controls">
          <div>
            <button
              className="control-button"
              onClick={() => decreaseLimit()}
            >
              <FiMinus />
            </button>
          </div>
          <div className="interval-limits">
            {displayIntervals.map((interval, index) => (
              <div key={index} className="interval-section">
                <div
                  className="color-line"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                {mapVisualisationMode === "money" ?
                  <span>{interval}/m^2</span> :
                  <span>{interval}m</span>
                }
              </div>
            ))}
          </div>
          <div>
            <button
              className="control-button"
              onClick={() => increaseLimit()}
            >
              <FiPlus />

            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayControls;
