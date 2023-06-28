import React, { ReactNode, useState, useRef, useEffect } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import "./SlideUpComponent.scss";

type defaultSnapProps = {
  lastSnap: number;
  snapPoints: number[];
};

type SnapPointProps = {
  smallPopUp: number;
  maxHeight: number;
};

interface IProps {
  selectedOption: any;
  top: ReactNode | null;
  middle: ReactNode | null;
  bottom: ReactNode | null;
  onClose: () => void; // Add onClose function as a prop
}

const SlideUpComponent: React.FC<IProps> = ({
  selectedOption,
  top,
  middle,
  bottom,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleDismiss = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className="slide-up-container"
        onClick={() => console.log("slide-up-container")}
      >
        <BottomSheet
          className="slide-up-container"
          open={isOpen}
          header={top}
          footer={bottom}
          snapPoints={({ footerHeight, headerHeight, maxHeight }: any) => [
            footerHeight + headerHeight - 1,
            maxHeight / 2,
            maxHeight,
          ]}
          defaultSnap={({ lastSnap, snapPoints }: any) =>
            lastSnap ?? Math.min(...snapPoints)
          }
        >
          {middle}
        </BottomSheet>
      </div>
    </>
  );
};

export default SlideUpComponent;
