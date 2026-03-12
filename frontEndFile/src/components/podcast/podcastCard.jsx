export default function PodcastCard({ podcast }) {
  return (
    <div className="podcast-card">
      <img src={podcast.artwork_url || "/placeholder.png"} alt={podcast.title} />
      <h3>{podcast.title}</h3>
      <p>{podcast.description || "No description available."}</p>
      <p>Status: {podcast.status}</p>
      <p>Explicit: {podcast.explicit ? "Yes" : "No"}</p>
    </div>
  );
}