import { useEffect, useState } from "react";
import PodcastHealthCard from "../components/health/podcastHealthCard";
import Button from "../components/ui/Button/button";
import { fetchPodcasts, checkHealth } from "../services/api";
import styles from "./feedHealth.module.css";

const FeedHealth = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  
  const loadPodcasts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPodcasts();

      
      const normalized = data.map((p) => ({
        ...p,
        health_status: p.health_status || "unknown",
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
      alert(err.message || "Health check failed");
    } finally {
      setLoadingId(null);
    }
  };

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
        podcasts.map((podcast) => (
          <PodcastHealthCard
            key={podcast.uuid}
            podcast={podcast}
            onCheckHealth={handleCheckHealth}
            loadingId={loadingId}
          />
        ))}
    </div>
  );
};

export default FeedHealth;