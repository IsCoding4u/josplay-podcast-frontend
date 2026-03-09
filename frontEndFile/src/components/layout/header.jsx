import { Link } from "react-router-dom";
import styles from "./header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <h2>Podcast Dashboard</h2>

      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/episodes">Episodes</Link>
      </nav>
    </header>
  );
};

export default Header;