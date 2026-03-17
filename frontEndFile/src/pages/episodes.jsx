import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EpisodeList from "../components/episodes/episodeList";
import { fetchPodcast } from "../services/api"; // ✅ FIXED

import styles from "./episodes.module.css";

export default function Episodes() {

  const { id } = useParams();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    const loadEpisodes = async () => {

      if (!id) return;

      setLoading(true);
      setError(null);

      try {

        // ✅ use correct API function
        const podcast = await fetchPodcast(id);

        const eps =
          podcast?.episodes ||
          podcast?.feed_details?.episodes ||
          [];

        setEpisodes(eps);

      } catch (err) {

        console.error("Failed to load episodes:", err);
        setError(err.message);

      } finally {

        setLoading(false);

      }
    };

    loadEpisodes();

  }, [id]);

  return (
    <div className={styles.episodesPage}>

      <h2>Episodes</h2>

      {loading && <p>Loading episodes...</p>}

      {error && (
        <p className={styles.error}>
          Failed to load episodes: {error}
        </p>
      )}

      {!loading && !error && (
        <EpisodeList episodes={episodes} />
      )}

    </div>
  );
}