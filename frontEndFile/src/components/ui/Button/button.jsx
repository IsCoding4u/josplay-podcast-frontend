import styles from "./button.module.css";
import PropTypes from "prop-types";

function Button({
  text,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false
}) {
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
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "success", "danger"]),
  disabled: PropTypes.bool
};

export default Button;