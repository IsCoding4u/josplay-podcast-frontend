import { useState, useMemo, useEffect } from "react";
import EpisodeCard from "./episodeCard";
import Pagination from "../ui/pagination/pagination"; 
import SearchBar from "../searchBar/searchBar";
import styles from "./episodeList.module.css";

export default function EpisodeList({ episodes = [], itemsPerPage = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery) return episodes;
    return episodes.filter(ep =>
      ep.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [episodes, searchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(filteredEpisodes.length / itemsPerPage),
    [filteredEpisodes, itemsPerPage]
  );

  const currentEpisodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEpisodes.slice(start, end);
  }, [currentPage, filteredEpisodes, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!episodes || episodes.length === 0) {
    return <p className="mb-4">No episodes available.</p>;
  }

  return (
    <div className={`${styles.container} p-4`}>
      <SearchBar 
        onSearch={setSearchQuery} 
        placeholder="Search episodes..." 
      />

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