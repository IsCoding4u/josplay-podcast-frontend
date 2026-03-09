import EpisodeCard from "../episodes/episodeCard";

const EpisodeList = ({ episodes }) => {
  return (
    <div>
      {episodes?.length ? (
        episodes.map((ep) => (
          <EpisodeCard
            key={ep.id}
            title={ep.title}
            date={ep.date}
          />
        ))
      ) : (
        <p>No episodes</p>
      )}
    </div>
  );
};

export default EpisodeList;