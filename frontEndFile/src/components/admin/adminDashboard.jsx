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
  fetchEpisodes,
} from "../../services/api";

const ITEMS_PER_PAGE = 6;

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
        (data || []).map((sub) => ({
          ...sub,
          podcast_name: sub.feed_details?.title || "Untitled Podcast",
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const loadApprovedPodcasts = async () => {
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

      setApprovedPodcasts(podcastsWithEpisodes);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = async (podcastOrSubmission, isApproved = false) => {
    setSelected({ ...podcastOrSubmission, loading: true, feed_details: null });

    try {
      const data = isApproved
        ? await fetchPodcast(podcastOrSubmission.uuid)
        : await fetchSubmissionDetails(podcastOrSubmission.uuid);

      let episodes = [];

      if (isApproved) {
        const episodesData = await fetchEpisodes(podcastOrSubmission.uuid);
        episodes = episodesData?.episodes || [];
      }

      setSelected({
        ...podcastOrSubmission,
        ...data,
        feed_details: {
          ...data.feed_details,
          episodes,
        },
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setSelected((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmission = async (sub, action) => {
    if (submittingRef.current[sub.uuid]) return;
    submittingRef.current[sub.uuid] = true;

    try {
      if (action === "approve") {
        await approveSubmission(sub.uuid);
      } else {
        await rejectSubmission(sub.uuid);
      }

      await loadSubmissions();
      await loadApprovedPodcasts();
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      submittingRef.current[sub.uuid] = false;
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

        {submissions.map((sub) => (
          <div key={sub.uuid} className={styles.card}>
            <div>
              <h4>{sub.podcast_name}</h4>
              <p>{sub.first_name} {sub.last_name}</p>
              <p>{sub.contact_email}</p>
            </div>

            <div className={styles.actions}>
              <Button onClick={() => openModal(sub)}>Details</Button>
              <Button variant="success" onClick={() => handleSubmission(sub, "approve")}>Approve</Button>
              <Button variant="danger" onClick={() => handleSubmission(sub, "reject")}>Reject</Button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3>Approved Podcasts</h3>

        {displayed.map((podcast) => (
          <div
            key={podcast.uuid}
            className={styles.card}
            onClick={() => openModal(podcast, true)}
          >
            <h4>{podcast.feed_details?.title || podcast.title}</h4>
            <p>{podcast.feed_details?.description || "-"}</p>
            <p>{podcast.feed_details?.episodes?.length || 0} Episodes</p>
          </div>
        ))}

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

            {selected.feed_details && (
              <EpisodeList episodes={selected.feed_details.episodes || []} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}