import { useEffect, useState, useRef } from "react";
import styles from "./admin.module.css";
import Button from "../ui/Button/button";
import Modal from "../ui/Modal/modal";
import EpisodeList from "../episodes/episodeList";
import Pagination from "../ui/pagination/pagination";
import toast from "react-hot-toast";

import {
  fetchPendingSubmissions,
  fetchSubmissionDetails,
  approveSubmission,
  rejectSubmission,
  fetchPodcasts,
  fetchPodcast,
  fetchEpisodes,
} from "../../services/api";

const ITEMS_PER_PAGE = 6;

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [approvedPodcasts, setApprovedPodcasts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [approvedPage, setApprovedPage] = useState(1);
  const [processing, setProcessing] = useState({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);

  const submittingRef = useRef({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadSubmissions(), loadApprovedPodcasts()]);
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await fetchPendingSubmissions();

      setSubmissions(
        (data || []).map((sub) => ({
          ...sub,
          podcast_name: sub.feed_details?.title || "Untitled Podcast",
        }))
      );
    } catch (err) {
      toast.error(err.message || "Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadApprovedPodcasts = async () => {
    setLoadingPodcasts(true);
    try {
      const data = await fetchPodcasts();

      const podcastsWithEpisodes = await Promise.all(
        (data || []).map(async (pod) => {
          try {
            const episodesData = await fetchEpisodes(pod.uuid);

            return {
              ...pod,
              feed_details: {
                ...pod.feed_details,
                episodes: episodesData?.episodes || [],
              },
            };
          } catch {
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

      setApprovedPodcasts(podcastsWithEpisodes);
    } catch (err) {
      toast.error(err.message || "Failed to load podcasts");
    } finally {
      setLoadingPodcasts(false);
    }
  };

  const openModal = async (item, isApproved = false) => {
    setSelected({ ...item, loading: true, feed_details: null });

    try {
      const data = isApproved
        ? await fetchPodcast(item.uuid)
        : await fetchSubmissionDetails(item.uuid);

      const episodesData = await fetchEpisodes(item.uuid);

      setSelected({
        ...item,
        ...data,
        feed_details: {
          ...data.feed_details,
          episodes: episodesData?.episodes || [],
        },
        loading: false,
      });
    } catch (err) {
      toast.error(err.message || "Failed to load details");
      setSelected((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmission = async (sub, action) => {
    if (submittingRef.current[sub.uuid]) return;
    submittingRef.current[sub.uuid] = true;

    setProcessing((prev) => ({ ...prev, [sub.uuid]: true }));

    const toastId = toast.loading(
      action === "approve" ? "Approving..." : "Rejecting..."
    );

    try {
      const result =
        action === "approve"
          ? await approveSubmission(sub.uuid)
          : await rejectSubmission(sub.uuid);

      toast.success(result.message, { id: toastId });

      setSubmissions((prev) =>
        prev.filter((item) => item.uuid !== sub.uuid)
      );

      setTimeout(() => {
        loadApprovedPodcasts();
      }, 1000);

      setSelected(null);
    } catch (err) {
      toast.error(err.message || "Action failed", { id: toastId });
    } finally {
      submittingRef.current[sub.uuid] = false;
      setProcessing((prev) => ({ ...prev, [sub.uuid]: false }));
    }
  };

  const totalPages = Math.ceil(approvedPodcasts.length / ITEMS_PER_PAGE);

  const displayed = approvedPodcasts.slice(
    (approvedPage - 1) * ITEMS_PER_PAGE,
    approvedPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Pending Submissions</h3>

        {loadingSubmissions ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p>No pending submissions</p>
        ) : (
          submissions.map((sub) => (
            <div key={sub.uuid} className={styles.card}>
              <div>
                <h4>{sub.podcast_name}</h4>
                <p>
                  {sub.first_name} {sub.last_name}
                </p>
                <p>{sub.contact_email}</p>
              </div>

              <div className={styles.actions}>
                <Button onClick={() => openModal(sub)}>Details</Button>

                <Button
                  variant="success"
                  disabled={processing[sub.uuid]}
                  onClick={() => handleSubmission(sub, "approve")}
                >
                  {processing[sub.uuid] ? "Processing..." : "Approve"}
                </Button>

                <Button
                  variant="danger"
                  disabled={processing[sub.uuid]}
                  onClick={() => handleSubmission(sub, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h3>Approved Podcasts</h3>

        {loadingPodcasts ? (
          <p>Loading podcasts...</p>
        ) : displayed.length === 0 ? (
          <p>No approved podcasts yet</p>
        ) : (
          displayed.map((podcast) => (
            <div
              key={podcast.uuid}
              className={styles.card}
              onClick={() => openModal(podcast, true)}
            >
              <h4>{podcast.feed_details?.title || podcast.title}</h4>
              <p>{podcast.feed_details?.description || "-"}</p>
              <p>{podcast.feed_details?.episodes?.length || 0} Episodes</p>
            </div>
          ))
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={approvedPage}
            totalPages={totalPages}
            onPageChange={setApprovedPage}
          />
        )}
      </section>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.feed_details?.title || selected?.title}
      >
        {selected && (
          <div>
            <p>{selected.rss_url}</p>

            {selected.loading ? (
              <p>Loading details...</p>
            ) : (
              <EpisodeList
                episodes={selected.feed_details?.episodes || []}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}