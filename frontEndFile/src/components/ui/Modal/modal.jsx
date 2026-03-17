import React from "react";
import styles from "./modal.module.css";
import Button from "../Button/button";

const Modal = ({ isOpen, onClose, title, children }) => {
  // If modal is not open, render nothing
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header with title and close button */}
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            &times;
          </Button>
        </div>

        {/* Modal content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;