import styles from "./button.module.css";
import PropTypes from "prop-types";

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = ""
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "success", "danger", "secondary"]),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Button;