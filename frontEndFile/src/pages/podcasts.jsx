// src/pages/podcasts.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPodcast } from "../services/api";
import EpisodeList from "../components/episodes/episodeList";
import styles from "./podcast.module.css";

export default function PodcastPage() {
  const { id: podcastId } = useParams();

  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!podcastId) return;

    async function loadPodcast() {
      try {
        setLoading(true);
        const data = await fetchPodcast(podcastId);

        setPodcast(data);
        setEpisodes(data.feed_details?.episodes || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load podcast");
      } finally {
        setLoading(false);
      }
    }

    loadPodcast();
  }, [podcastId]);

  if (loading) return <p className={styles.message}>Loading podcast...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!podcast) return <p className={styles.message}>Podcast not found</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {podcast.feed_details?.image && (
          <img
            src={podcast.feed_details.image}
            alt={podcast.title}
            className={styles.artwork}
          />
        )}
        <div>
          <h1 className={styles.title}>{podcast.title}</h1>
          <p className={styles.description}>
            {podcast.feed_details?.description || "No description available"}
          </p>
        </div>
      </div>

      <div className={styles.episodes}>
        <h2>Episodes</h2>
        {episodes.length > 0 ? (
          <EpisodeList episodes={episodes} />
        ) : (
          <p>No episodes available</p>
        )}
      </div>
    </div>
  );
}