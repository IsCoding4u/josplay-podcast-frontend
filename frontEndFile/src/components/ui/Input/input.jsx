import styles from "./input.module.css";

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  error
}) => {
  return (
    <div className={styles.container}>
      {label && <label>{label}</label>}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;