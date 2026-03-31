import { useState, useEffect } from "react";
import styles from "./searchBar.module.css";

export default function SearchBar({ onSearch, placeholder }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      if (onSearch) onSearch(query.trim());
    }, 400);
    return () => clearTimeout(delay);
  }, [query, onSearch]);

  const clearQuery = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      {query && <button onClick={clearQuery} className={styles.clearButton}>×</button>}
    </div>
  );
}