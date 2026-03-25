const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_KEY;
console.log("Admin API Key Loaded:", process.env.REACT_APP_ADMIN_KEY);

const handleFetch = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
        ...(ADMIN_API_KEY ? { "x-Admin-API-key": ADMIN_API_KEY } : {}),
      },
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(
        data.detail || data.message || `Request failed (${res.status})`
      );
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
};

const validateSubmission = (data) => {
  if (!data) throw new Error("No data provided");

  if (!data.first_name?.trim()) throw new Error("First name is required");
  if (!data.last_name?.trim()) throw new Error("Last name is required");
  if (!data.contact_email?.includes("@")) throw new Error("Invalid email address");

  const rssUrl = (data.rss_url || "").trim();
  const urlPattern = /^https?:\/\/\S+$/i;
  if (!rssUrl || !urlPattern.test(rssUrl)) {
    const err = new Error("Invalid RSS URL");
    err.status = 400;
    throw err;
  }

  if (data.notes && data.notes.length > 500) throw new Error("Notes too long");

  return true;
};

export const submitPodcast = async (data, onSubmitting = null) => {
  validateSubmission(data);

  if (onSubmitting) onSubmitting(true);

  try {
    const cleanBody = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null && v !== "")
    );

    return await handleFetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanBody),
    });
  } finally {
    if (onSubmitting) onSubmitting(false);
  }
};

export const fetchPendingSubmissions = async () =>
  handleFetch(`${API_BASE}/submissions/pending`);

export const fetchSubmissionDetails = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  return handleFetch(
    `${API_BASE}/submissions/${encodeURIComponent(submissionId)}`
  );
};

export const approveSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  return handleFetch(
    `${API_BASE}/admin/approve/${encodeURIComponent(submissionId)}`,
    { method: "POST" }
  );
};

export const rejectSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  return handleFetch(
    `${API_BASE}/admin/reject/${encodeURIComponent(submissionId)}`,
    { method: "POST" }
  );
};

export const fetchPodcasts = async () => handleFetch(`${API_BASE}/podcasts`);

export const fetchPodcast = async (podcastId) => {
  if (!podcastId) throw new Error("Podcast ID is required");

  return handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(podcastId)}`);
};

export const checkHealth = async (id) => {
  if (!id) throw new Error("Podcast ID is required");

  return handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(id)}/check-health`, {
    method: "POST",
  });
};