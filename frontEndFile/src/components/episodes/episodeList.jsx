import { useState, useMemo } from "react";
import EpisodeCard from "./episodeCard";
import Pagination from "../ui/pagination/pagination"; 
import styles from "./episodeList.module.css";

export default function EpisodeList({ episodes = [], itemsPerPage = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(episodes.length / itemsPerPage),
    [episodes, itemsPerPage]
  );

  const currentEpisodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return episodes.slice(start, end);
  }, [currentPage, episodes, itemsPerPage]);

  if (!episodes || episodes.length === 0) {
    return <p className="mb-4">No episodes available.</p>;
  }

  return (
    <div className={`${styles.container} p-4`}>
      {currentEpisodes.map((ep, idx) => (
        <div key={ep.guid || idx} className="mb-4">
          <EpisodeCard episode={ep} />
        </div>
      ))}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}