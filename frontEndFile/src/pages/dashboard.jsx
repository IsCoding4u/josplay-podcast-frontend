import { useState, useEffect } from "react";
import EpisodeList from "../components/episodes/episodeList";
import FeedForm from "../components/feeds/FeedForm";
import { fetchPodcasts } from "../services/api";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLatestEpisodes = async () => {
      setLoading(true);

      try {
        const podcasts = await fetchPodcasts();

        if (!Array.isArray(podcasts) || podcasts.length === 0) {
          setEpisodes([]);
          return;
        }

        const latestPodcast = podcasts[0];
        setEpisodes(latestPodcast?.feed_details?.episodes || []);
      } catch (err) {
        console.error(err);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    loadLatestEpisodes();
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
        {loading ? <p>Loading...</p> : <EpisodeList episodes={episodes} />}
      </div>
    </div>
  );
}