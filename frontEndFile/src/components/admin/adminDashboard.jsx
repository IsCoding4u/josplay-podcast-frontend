import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./admin.module.css";

import {
  fetchPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  fetchPodcasts,
  fetchSubmissionDetails,
  fetchPodcast,
} from "../../services/api";

import Button from "../ui/Button/button";
import Modal from "../ui/Modal/modal";
import EpisodeList from "../episodes/episodeList";
import Pagination from "../ui/pagination/pagination"; 

const ITEMS_PER_PAGE = 6;

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [approvedPodcasts, setApprovedPodcasts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [approvedPage, setApprovedPage] = useState(1);

  const submittingRef = useRef({});

  
  const loadSubmissions = async () => {
    try {
      const data = await fetchPendingSubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
      alert(`Failed to load submissions: ${err.message}`);
    }
  };

 
  const loadApprovedPodcasts = async () => {
    try {
      const data = await fetchPodcasts();
      
      const sorted = (data || []).sort(
        (a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at)
      );
      setApprovedPodcasts(sorted);
    } catch (err) {
      console.error(err);
      alert(`Failed to load approved podcasts: ${err.message}`);
    }
  };

  useEffect(() => {
    loadSubmissions();
    loadApprovedPodcasts();
  }, []);

 
  const handleSubmission = async (submission, action) => {
    const { uuid } = submission;
    if (submittingRef.current[uuid]) return;

    submittingRef.current[uuid] = true;
    try {
      if (action === "approve") {
        await approveSubmission(uuid);
      } else {
        await rejectSubmission(uuid);
      }

      await loadSubmissions();
      await loadApprovedPodcasts();
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert(`Action failed: ${err.message}`);
    } finally {
      submittingRef.current[uuid] = false;
    }
  };

 
  const openModal = async (entity) => {
    setSelected({ ...entity, loading: true, feed_details: null });
    try {
      let data;
      if (entity.status === "pending_review") {
        data = await fetchSubmissionDetails(entity.uuid);
      } else {
        data = await fetchPodcast(entity.uuid);
      }

      setSelected({
        ...entity,
        ...data,
        feed_details: data.feed_details,
        loading: false,
      });
    } catch (err) {
      console.error("Modal load error:", err);
      setSelected((prev) => ({ ...prev, loading: false }));
      alert(err.message);
    }
  };

 
  const totalApprovedPages = useMemo(
    () => Math.ceil(approvedPodcasts.length / ITEMS_PER_PAGE),
    [approvedPodcasts]
  );

  const displayedApproved = useMemo(() => {
    const start = (approvedPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return approvedPodcasts.slice(start, end);
  }, [approvedPodcasts, approvedPage]);

  return (
    <div className={styles.container}>
      <h2>Admin Dashboard</h2>

     
      <section>
        <h3>Pending Podcast Submissions</h3>
        {submissions.length === 0 && <p>No pending submissions.</p>}

        {submissions.map((sub) => (
          <div key={sub.uuid} className={styles.card}>
            <div>
              <h4>{sub.podcast_name || "Untitled Podcast"}</h4>
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
        <h3>Approved Podcasts</h3>
        {approvedPodcasts.length === 0 && <p>No approved podcasts yet.</p>}

        {displayedApproved.map((podcast) => (
          <div
            key={podcast.uuid}
            className={styles.card}
            onClick={() => openModal(podcast)}
            style={{ cursor: "pointer" }}
          >
            <h4>{podcast.title}</h4>
            {podcast.feed_details?.image && (
              <img
                src={podcast.feed_details.image}
                alt="Podcast Artwork"
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
          <div style={{ marginTop: "1rem" }}>
            <Pagination
              currentPage={approvedPage}
              totalPages={totalApprovedPages}
              onPageChange={setApprovedPage}
            />
          </div>
        )}
      </section>

     
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.podcast_name || selected?.title || "Podcast Details"}
      >
        {selected && (
          <div>
            <p>
              <b>RSS URL:</b>{" "}
              <a href={selected.rss_url} target="_blank" rel="noopener noreferrer">{selected.rss_url}</a>
            </p>
            <p><b>Country:</b> {selected.country || "-"}</p>
            <p><b>Language:</b> {selected.language || "-"}</p>
            <p><b>Submitted:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString() : "-"}</p>

            {selected.loading && <p>Loading feed details...</p>}

            {selected.feed_details && (
              <>
                <h4>{selected.feed_details.title || "Untitled"}</h4>
                {selected.feed_details.image && (
                  <img
                    src={selected.feed_details.image}
                    alt="Podcast Artwork"
                    width="150"
                    style={{ borderRadius: "10px" }}
                  />
                )}
                <p>{selected.feed_details.description || "-"}</p>
                <p>Episodes: {selected.feed_details.episodes?.length || 0}</p>

                <EpisodeList
                  episodes={selected.feed_details.episodes || []}
                  itemsPerPage={5}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}