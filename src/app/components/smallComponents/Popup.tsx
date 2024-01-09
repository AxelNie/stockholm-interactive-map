import React, { ReactNode, useEffect, useRef } from "react";
import { MdOutlineClose } from "react-icons/md";
import "./Popup.scss";

interface PopupProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ children, isOpen, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-backdrop">
      <div ref={ref} className="popup-content">
        <MdOutlineClose onClick={() => onClose()} className="close-icon" />
        {children}
      </div>
    </div>
  );
};

export default Popup;
