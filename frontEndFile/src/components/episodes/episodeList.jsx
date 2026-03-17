import { useState, useMemo } from "react";
import EpisodeCard from "./episodeCard";
import styles from "./episodeList.module.css";

export default function EpisodeList({ episodes = [], itemsPerPage = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- Total Pages Calculation ----------------
  const totalPages = useMemo(
    () => Math.ceil(episodes.length / itemsPerPage),
    [episodes, itemsPerPage]
  );

  // ---------------- Slice Episodes for Current Page ----------------
  const currentEpisodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return episodes.slice(start, end);
  }, [currentPage, episodes, itemsPerPage]);

  // ---------------- Pagination Handlers ----------------
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleBack = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // ---------------- No Episodes Case ----------------
  if (!episodes || episodes.length === 0) {
    return <p>No episodes available.</p>;
  }

  return (
    <div className={styles.container}>
      {currentEpisodes.map((ep, idx) => (
        <EpisodeCard key={ep.guid || idx} episode={ep} />
      ))}

      {/* ---------------- Pagination Controls ---------------- */}
      <div className={styles.pagination}>
        <button onClick={handleBack} disabled={currentPage === 1}>
          ⬅ Back
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
}