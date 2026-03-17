
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
        >
          Your browser does not support the audio element.
        </audio>
      )}

    </div>
  );
}