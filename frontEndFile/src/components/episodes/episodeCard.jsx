import React from "react";
import styles from "./episodeCard.module.css";

export default function EpisodeCard({ episode }) {
  const image =
    episode.image ||
    episode.itunes_image ||
    episode.thumbnail ||
    null;

  const audio =
    episode.audio_url ||
    episode.enclosure?.url ||
    null;

  const video =
    episode.video_url ||
    episode.enclosure?.video ||
    null;

  const duration =
    episode.duration ||
    episode.itunes_duration ||
    "N/A";

  const published =
    episode.published ||
    episode.pubDate ||
    null;

  return (
    <div className={styles.card}>
      {image && (
        <img
          src={image}
          alt="Episode Artwork"
          className={styles.thumbnail}
        />
      )}

      <div className={styles.info}>
        <h4 className={styles.title}>
          {episode.title || "Untitled Episode"}
        </h4>

        {published && (
          <p className={styles.date}>
            {new Date(published).toLocaleDateString()}
          </p>
        )}

        <p className={styles.duration}>
          Duration: {duration}
        </p>
      </div>

      {audio && (
        <audio
          controls
          preload="none"
          className={styles.audioPlayer}
          src={audio}
          onError={() => console.error("Audio playback failed:", audio)}
        >
          Your browser does not support the audio element.
        </audio>
      )}

      {video && (
        <video
          controls
          preload="none"
          className={styles.audioPlayer}
          style={{ marginTop: "10px" }}
          src={video}
          onError={() => console.error("Video playback failed:", video)}
        >
          Your browser does not support the video element.
        </video>
      )}

      {!audio && !video && (
        <p style={{ color: "red", marginTop: "10px" }}>
          No playable media available for this episode.
        </p>
      )}
    </div>
  );
}