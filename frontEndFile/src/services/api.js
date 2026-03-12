
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

let submitting = false;

export async function fetchPodcast(podcastId) {
  if (!podcastId) throw new Error("Podcast ID is required");

  const res = await fetch(`${API_BASE}/podcasts/${encodeURIComponent(podcastId)}`);
  if (!res.ok) throw new Error("Failed to fetch podcast");

  return res.json();
}


export async function submitPodcast(data) {
  if (submitting) return;
  
  if (!data?.rss_url || !data?.contact_email) throw new Error("Missing required fields");

  submitting = true;

  try {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rss_url: data.rss_url,
        contact_email: data.contact_email,
        podcast_name: data.podcast_name || null,
        country: data.country || null,
        language: data.language || null,
        notes: data.notes || null,
      }),
    });

    if (!res.ok) throw new Error("Failed to submit podcast");
    return res.json();
  } finally {
    submitting = false;
  }
}


export async function approveSubmission(submissionId) {
  if (!submissionId) throw new Error("Submission ID required");

  const res = await fetch(`${API_BASE}/admin/approve/${encodeURIComponent(submissionId)}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to approve submission");
  return res.json();
}