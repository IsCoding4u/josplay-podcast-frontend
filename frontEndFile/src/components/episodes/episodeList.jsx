import EpisodeCard from "./episodeCard";

export default function EpisodeList({ episodes }) {
  return (
    <div className="episode-list">
      {episodes?.length ? (
        episodes.map((episode) => (
          <EpisodeCard key={episode.uuid} episode={episode} />
        ))
      ) : (
        <p>No episodes available</p>
      )}
    </div>
  );
}