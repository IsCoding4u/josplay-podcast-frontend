import { useState, useEffect } from "react";
import EpisodeList from "../components/episodes/episodeList";
import FeedForm from "../components/feeds/FeedForm";
import { fetchPodcast } from "../services/api";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEpisodes = async () => {
      setLoading(true);
      try {
        const podcast = await fetchPodcast("example-podcast-id");
        setEpisodes(podcast.episodes || []);
      } catch (err) {
        console.error("Failed to load episodes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEpisodes();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Podcast Dashboard</h1>
      </div>

      <div className={styles.feedForm}>
        <h2>Add Podcast Feed</h2>
        <FeedForm />
      </div>

      <div className={styles.episodeList}>
        <h2>Episodes</h2>
        {loading ? <p>Loading...</p> : <EpisodeList episodes={episodes} />}
      </div>
    </div>
  );
}