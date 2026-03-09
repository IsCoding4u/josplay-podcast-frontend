// src/components/ui/Button/button.tsx
import styles from "./button.module.css"; // <-- fixed

type ButtonProps = {
  text: string; // use `text` instead of children
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "success" | "danger";
  disabled?: boolean;
};

const Button = ({
  text,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false
}: ButtonProps) => {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${styles.button} ${styles[variant]}`}
      >
        {text}
      </button>
    );
  };

export default Button;