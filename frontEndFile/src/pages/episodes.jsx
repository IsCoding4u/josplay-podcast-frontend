import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EpisodeList from "../components/episodes/episodeList";
import { fetchPodcast } from "../services/api";
import styles from "./episodes.module.css";

export default function Episodes() {
  const { id } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEpisodes = async () => {
      setLoading(true);
      try {
        const podcast = await fetchPodcast(id);
        setEpisodes(podcast.episodes || []);
      } catch (err) {
        console.error("Failed to load episodes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEpisodes();
  }, [id]);

  return (
    <div className={styles.episodesPage}>
      <h2>Episodes</h2>
      {loading ? <p>Loading...</p> : <EpisodeList episodes={episodes} />}
    </div>
  );
}