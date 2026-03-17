import React from "react";
import styles from "./modal.module.css";
import Button from "../Button/button";

const Modal = ({ isOpen, onClose, title, children }) => {
  
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
     
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            &times;
          </Button>
        </div>

        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;