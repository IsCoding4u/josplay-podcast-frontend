import styles from "./episodeCard.module.css";

const EpisodeCard = ({ title, date }) => {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <span>{date}</span>
    </div>
  );
};

export default EpisodeCard;