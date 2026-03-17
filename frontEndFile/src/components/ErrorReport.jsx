

import React from "react";
import Button from "../../src/components/ui/Button/button";
import styles from "./errorReport.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function ErrorReport({ error, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <FontAwesomeIcon icon={faTimes} className={styles.close} onClick={onClose} />
        </div>
        <div className={styles.content}>
          <p className={styles.error}>
            {error.message}
          </p>

        <Button onClick={onClose} className={styles.okButton}>
          OK
        </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorReport;

