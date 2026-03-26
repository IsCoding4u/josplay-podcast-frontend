const API_BASE = process.env.REACT_APP_API_BASE || "https://127.0.0.1:8000";
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
      const errMsg =
        data.detail || data.message || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    } else if (err.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Check your network.");
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
    throw new Error("Invalid RSS URL");
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

    const response = await handleFetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanBody),
    });

    return response;
  } catch (err) {
    
    console.error("submitPodcast error:", err);
    throw new Error(err.message || "Failed to submit podcast. Try again later.");
  } finally {
    if (onSubmitting) onSubmitting(false);
  }
};

export const fetchPendingSubmissions = async () => {
  try {
    return await handleFetch(`${API_BASE}/submissions/pending`);
  } catch (err) {
    console.error("fetchPendingSubmissions error:", err);
    throw new Error(err.message || "Failed to fetch pending submissions.");
  }
};

export const fetchSubmissionDetails = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  try {
    return await handleFetch(`${API_BASE}/submissions/${encodeURIComponent(submissionId)}`);
  } catch (err) {
    console.error("fetchSubmissionDetails error:", err);
    throw new Error(err.message || "Failed to fetch submission details.");
  }
};

export const approveSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  try {
    return await handleFetch(
      `${API_BASE}/admin/approve/${encodeURIComponent(submissionId)}`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("approveSubmission error:", err);
    throw new Error(err.message || "Failed to approve submission.");
  }
};

export const rejectSubmission = async (submissionId) => {
  if (!submissionId) throw new Error("Submission ID is required");

  try {
    return await handleFetch(
      `${API_BASE}/admin/reject/${encodeURIComponent(submissionId)}`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("rejectSubmission error:", err);
    throw new Error(err.message || "Failed to reject submission.");
  }
};


export const fetchPodcasts = async () => {
  try {
    return await handleFetch(`${API_BASE}/podcasts`);
  } catch (err) {
    console.error("fetchPodcasts error:", err);
    throw new Error(err.message || "Failed to fetch podcasts.");
  }
};

export const fetchPodcast = async (podcastId) => {
  if (!podcastId) throw new Error("Podcast ID is required");

  try {
    return await handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(podcastId)}`);
  } catch (err) {
    console.error("fetchPodcast error:", err);
    throw new Error(err.message || "Failed to fetch podcast.");
  }
};

export const checkHealth = async (id) => {
  if (!id) throw new Error("Podcast ID is required");

  try {
    return await handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(id)}/check-health`, {
      method: "POST",
    });
  } catch (err) {
    console.error("checkHealth error:", err);
    throw new Error(err.message || "Failed to check podcast health.");
  }
};