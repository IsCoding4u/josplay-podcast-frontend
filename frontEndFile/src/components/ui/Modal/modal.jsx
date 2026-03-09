import styles from "./modal.module.css";
import Button from "../Button/button";

const Modal = ({ isOpen, onClose, title, children }) => {
  return isOpen ? (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            X
          </Button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  ) : null;
};

export default Modal;