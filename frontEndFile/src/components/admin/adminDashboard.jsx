import { useEffect, useState, useRef } from "react";
import styles from "./admin.module.css";
import Button from "../ui/Button/button";
import Modal from "../ui/Modal/modal";
import EpisodeList from "../episodes/episodeList";
import Pagination from "../ui/pagination/pagination";
import {
  fetchPendingSubmissions,
  fetchSubmissionDetails,
  approveSubmission,
  rejectSubmission,
  fetchPodcasts,
  fetchPodcast,
} from "../../services/api";

const ITEMS_PER_PAGE = 6;
const BACKEND_URL = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [approvedPodcasts, setApprovedPodcasts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [approvedPage, setApprovedPage] = useState(1);
  const submittingRef = useRef({});

  useEffect(() => {
    loadSubmissions();
    loadApprovedPodcasts();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await fetchPendingSubmissions();
      setSubmissions(
        data?.map((sub) => ({
          ...sub,
          podcast_name: sub.feed_details?.title || "Untitled Podcast",
        })) || []
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load pending submissions.");
    }
  };

  const loadApprovedPodcasts = async () => {
    try {
      const data = await fetchPodcasts();
      const podcastsWithEpisodes = await Promise.all(
        data.map(async (pod) => {
          try {
            const res = await fetch(`${BACKEND_URL}/podcasts/${pod.uuid}/episodes`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const episodesData = await res.json();
            return {
              ...pod,
              feed_details: {
                ...pod.feed_details,
                episodes: episodesData.episodes || [],
              },
            };
          } catch (err) {
            console.error(err);
            return {
              ...pod,
              feed_details: {
                ...pod.feed_details,
                episodes: [],
              },
            };
          }
        })
      );
      setApprovedPodcasts(podcastsWithEpisodes || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load approved podcasts.");
    }
  };

  const openModal = async (podcastOrSubmission, isApproved = false) => {
    setSelected({ ...podcastOrSubmission, loading: true, feed_details: null });

    try {
      const data = isApproved
        ? await fetchPodcast(podcastOrSubmission.uuid)
        : await fetchSubmissionDetails(podcastOrSubmission.uuid);

      if (isApproved) {
        try {
          const res = await fetch(`${BACKEND_URL}/podcasts/${podcastOrSubmission.uuid}/episodes`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const episodesData = await res.json();
          data.feed_details = {
            ...data.feed_details,
            episodes: episodesData.episodes || [],
          };
        } catch (err) {
          console.error(err);
          alert("Failed to load episodes from backend.");
          data.feed_details = { ...data.feed_details, episodes: [] };
        }
      }

      setSelected({ ...podcastOrSubmission, ...data, loading: false });
    } catch (err) {
      console.error(err);
      setSelected((prev) => ({ ...prev, loading: false }));
      alert("Failed to load feed details.");
    }
  };

  const handleSubmission = async (sub, action) => {
    if (submittingRef.current[sub.uuid]) return;
    submittingRef.current[sub.uuid] = true;

    try {
      if (action === "approve") await approveSubmission(sub.uuid);
      else await rejectSubmission(sub.uuid);

      await loadSubmissions();
      await loadApprovedPodcasts();
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} submission.`);
    } finally {
      submittingRef.current[sub.uuid] = false;
    }
  };

  const totalApprovedPages = Math.ceil(approvedPodcasts.length / ITEMS_PER_PAGE);
  const displayedApproved = approvedPodcasts.slice(
    (approvedPage - 1) * ITEMS_PER_PAGE,
    approvedPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Pending Submissions</h3>
        {submissions.length === 0 && <p>No pending submissions.</p>}
        {submissions.map((sub) => (
          <div key={sub.uuid} className={styles.card}>
            <div>
              <h4>{sub.podcast_name}</h4>
              <p>{sub.first_name} {sub.last_name}</p>
              <p>{sub.contact_email}</p>
            </div>
            <div className={styles.actions}>
              <Button variant="primary" onClick={() => openModal(sub)}>Details</Button>
              <Button variant="success" onClick={() => handleSubmission(sub, "approve")}>Approve</Button>
              <Button variant="danger" onClick={() => handleSubmission(sub, "reject")}>Reject</Button>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3 className={styles.centerTitle}>Approved Podcasts</h3>
        {approvedPodcasts.length === 0 && <p>No approved podcasts yet.</p>}
        {displayedApproved.map((podcast) => (
          <div
            key={podcast.uuid}
            className={styles.card}
            onClick={() => openModal(podcast, true)}
            style={{ cursor: "pointer" }}
          >
            <h4>{podcast.feed_details?.title || podcast.title}</h4>
            {podcast.feed_details?.image && (
              <img
                src={podcast.feed_details.image}
                alt="Artwork"
                width="150"
                style={{ borderRadius: "10px", marginTop: "10px" }}
              />
            )}
            <p>{podcast.feed_details?.description || "-"}</p>
            <p><b>Status:</b> {podcast.status}</p>
            <p><b>Episodes:</b> {podcast.feed_details?.episodes?.length || 0}</p>
          </div>
        ))}
        {totalApprovedPages > 1 && (
          <Pagination
            currentPage={approvedPage}
            totalPages={totalApprovedPages}
            onPageChange={setApprovedPage}
          />
        )}
      </section>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.feed_details?.title || selected?.title || "Podcast Details"}
      >
        {selected && (
          <div>
            <p><b>RSS URL:</b> <a href={selected.rss_url} target="_blank" rel="noopener noreferrer">{selected.rss_url}</a></p>
            <p><b>Country:</b> {selected.country || "-"}</p>
            <p><b>Language:</b> {selected.language || "-"}</p>
            <p><b>Submitted:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString() : "-"}</p>
            {selected.loading && <p>Loading feed details...</p>}
            {selected.feed_details && (
              <>
                {selected.feed_details.image && (
                  <img
                    src={selected.feed_details.image}
                    alt="Artwork"
                    width="150"
                    style={{ borderRadius: "10px" }}
                  />
                )}
                <p>{selected.feed_details.description || "-"}</p>
                <p>Episodes: {selected.feed_details.episodes?.length || 0}</p>
                <EpisodeList episodes={selected.feed_details.episodes || []} itemsPerPage={5} />
              </>
            )}

            {!selected.status || selected.status === "pending_review" ? (
              <div className={styles.modalActions}>
                <Button
                  variant="success"
                  onClick={() => handleSubmission(selected, "approve")}
                  disabled={submittingRef.current[selected.uuid]}
                >
                  {submittingRef.current[selected.uuid] ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleSubmission(selected, "reject")}
                  disabled={submittingRef.current[selected.uuid]}
                >
                  {submittingRef.current[selected.uuid] ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}