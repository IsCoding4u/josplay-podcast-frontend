export default function PodcastCard({ podcast }) {
  const episodeCount =
    podcast.feed_details?.episodes?.length || podcast.episode_count || 0;

  return (
    <div className="podcast-card">
      <img
        src={podcast.feed_details?.image || podcast.artwork_url || "/placeholder.png"}
        alt={podcast.title}
        style={{ borderRadius: "10px", width: "150px", height: "150px", objectFit: "cover" }}
      />
      <h3>{podcast.title}</h3>
      <p>{podcast.feed_details?.description || podcast.description || "No description available."}</p>
      <p>Status: {podcast.status}</p>
      <p>Explicit: {podcast.explicit ? "Yes" : "No"}</p>
      <p>Episodes: {episodeCount}</p>
    </div>
  );
}