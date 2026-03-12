
import styles from "./episodeCard.module.css";

export default function EpisodeCard({ episode }) {
  if (!episode) return null;

  const formattedDate = episode.published_at
    ? new Date(episode.published_at).toLocaleDateString()
    : "Unknown date";

  return (
    <div className={styles.card}>
      <h4>{episode.title}</h4>
      {episode.audio_url && (
        <audio controls src={episode.audio_url}>
          Your browser does not support the audio element.
        </audio>
      )}
      <p>{episode.description || "No description available"}</p>
      <p>Published: {formattedDate}</p>
      <p>Duration: {episode.duration ?? "Unknown"} sec</p>
    </div>
  );
}