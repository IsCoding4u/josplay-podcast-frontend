const API_BASE = "https://51.21.168.167";

const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_KEY;

const buildUrl = (path) => `${API_BASE}${path}`;

const handleFetch = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
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
      const error = new Error(
        data.detail || data.message || `Request failed (${res.status})`
      );
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout. Backend is taking too long.");
    }

    if (err.message === "Failed to fetch") {
      throw new Error("Network issue. Please check your connection.");
    }

    throw err;
  } finally {
    clearTimeout(id);
  }
};

const validateSubmission = (data) => {
  if (!data) throw new Error("No data provided");

  if (!data.first_name?.trim()) {
    throw new Error("First name is required");
  }

  if (!data.last_name?.trim()) {
    throw new Error("Last name is required");
  }

  if (!data.contact_email?.includes("@")) {
    throw new Error("Invalid email address");
  }

  const rssUrl = (data.rss_url || "").trim();
  const urlPattern = /^https?:\/\/\S+$/i;

  if (!rssUrl || !urlPattern.test(rssUrl)) {
    throw new Error("Invalid RSS URL");
  }

  if (data.notes && data.notes.length > 500) {
    throw new Error("Notes too long");
  }

  return true;
};

export const submitPodcast = async (data, onSubmitting = null) => {
  validateSubmission(data);

  if (onSubmitting) onSubmitting(true);

  try {
    const cleanBody = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null && v !== "")
    );

    const res = await handleFetch(buildUrl("/submissions"), {
      method: "POST",
      body: JSON.stringify(cleanBody),
    });

    return {
      message: res.message || "Podcast submitted successfully",
      ...res,
    };
  } finally {
    if (onSubmitting) onSubmitting(false);
  }
};

export const fetchPendingSubmissions = () =>
  handleFetch(buildUrl("/submissions/pending"));

export const fetchSubmissionDetails = (id) =>
  handleFetch(buildUrl(`/submissions/${encodeURIComponent(id)}`));

export const approveSubmission = async (id) => {
  const res = await handleFetch(
    buildUrl(`/admin/approve/${encodeURIComponent(id)}`),
    { method: "POST" }
  );

  return {
    message: res.message || "Approved successfully",
    ...res,
  };
};

export const rejectSubmission = async (id) => {
  const res = await handleFetch(
    buildUrl(`/admin/reject/${encodeURIComponent(id)}`),
    { method: "POST" }
  );

  return {
    message: res.message || "Rejected successfully",
    ...res,
  };
};

let podcastsCache = null;
let podcastsLastFetch = 0;
const PODCAST_CACHE_TTL = 30000;

export const fetchPodcasts = async () => {
  const now = Date.now();

  if (podcastsCache && now - podcastsLastFetch < PODCAST_CACHE_TTL) {
    return podcastsCache;
  }

  const data = await handleFetch(buildUrl("/podcasts"));

  podcastsCache = data;
  podcastsLastFetch = now;

  return data;
};

export const fetchPodcast = (id) =>
  handleFetch(buildUrl(`/podcasts/${encodeURIComponent(id)}`));

export const fetchEpisodes = (id) =>
  handleFetch(buildUrl(`/podcasts/${encodeURIComponent(id)}/episodes`));

export const checkHealth = (id) =>
  handleFetch(
    buildUrl(`/podcasts/${encodeURIComponent(id)}/check-health`),
    { method: "POST" }
  );