import { useEffect, useState } from "react";
import PodcastHealthCard from "../components/health/podcastHealthCard";
import Button from "../components/ui/Button/button";
import Pagination from "../components/ui/pagination/pagination";
import { fetchPodcasts, checkHealth } from "../services/api";
import styles from "./feedHealth.module.css";

const ITEMS_PER_PAGE = 5;

const FeedHealth = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPodcasts();

      const normalized = data.map((p) => ({
        ...p,
        health_status: p.health_status || "unknown",
        last_checked_at: p.last_checked_at || null,
        response_time_ms: p.response_time_ms || null,
        error_message: p.error_message || "",
      }));

      setPodcasts(normalized);
    } catch (err) {
      setError(err.message || "Failed to load podcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPodcasts((prev) =>
        prev.map((p) => {
          const statuses = ["healthy", "degraded", "broken"];
          const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];

          return {
            ...p,
            health_status: randomStatus,
            last_checked_at: new Date().toISOString(),
            response_time_ms: Math.random() * 500,
            error_message:
              randomStatus === "broken"
                ? "Failed to fetch RSS feed"
                : "",
          };
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckHealth = async (id) => {
    try {
      setLoadingId(id);
      const result = await checkHealth(id);

      setPodcasts((prev) =>
        prev.map((p) =>
          p.uuid === id
            ? {
                ...p,
                health_status: result.status || "unknown",
                error_message: result.error,
                response_time_ms: result.response_time,
                last_checked_at: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (err) {
      setPodcasts((prev) =>
        prev.map((p) =>
          p.uuid === id
            ? { ...p, health_status: "unknown", error_message: err.message }
            : p
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  const totalPages = Math.ceil(podcasts.length / ITEMS_PER_PAGE);

  const displayedPodcasts = podcasts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Feed Health Dashboard</h2>

      <div className={styles.topBar}>
        <Button onClick={loadPodcasts} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p>Loading podcasts...</p>}
      {!loading && podcasts.length === 0 && (
        <p className={styles.empty}>No podcasts available.</p>
      )}

      {!loading &&
        displayedPodcasts.map((podcast) => (
          <PodcastHealthCard
            key={podcast.uuid}
            podcast={podcast}
            onCheckHealth={handleCheckHealth}
            loadingId={loadingId}
          />
        ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default FeedHealth;