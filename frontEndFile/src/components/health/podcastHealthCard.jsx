import Button from "../ui/Button/button";
import HealthBadge from "./healthBadge";
import styles from "./podcastHealthCard.module.css";

export default function PodcastHealthCard({
  podcast,
  onCheckHealth,
  loadingId,
}){
  const isLoading = loadingId === podcast.uuid;

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{podcast.title}</h4>

      <p className={styles.url}>{podcast.rss_url}</p>

      <div className={styles.row}>
        <span className={styles.label}>Status:</span>
        <HealthBadge status={podcast.health_status || "unknown"} />
      </div>

      
      <div className={styles.row}>
        <span className={styles.label}>Last Checked:</span>
        <span>
          {podcast.last_checked_at
            ? new Date(podcast.last_checked_at).toLocaleString()
            : "Never"}
        </span>
      </div>

     
      <div className={styles.row}>
        <span className={styles.label}>Response Time:</span>
        <span>
          {podcast.response_time_ms
            ? `${Math.round(podcast.response_time_ms)} ms`
            : "-"}
        </span>
      </div>

    
      {podcast.error_message && (
        <div className={styles.error}>
          ⚠ {podcast.error_message}
        </div>
      )}

     
      <div className={styles.actions}>
        <Button
          onClick={() => onCheckHealth(podcast.uuid)}
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Check Health"}
        </Button>
      </div>
    </div>
  );
}