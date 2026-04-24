const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "/api");

const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_KEY;

const handleFetch = async (
  url,
  options = {},
  timeout = 60000,
  retries = 2
) => {
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
        data.detail ||
        data.message ||
        `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data;
  } catch (err) {
    if (retries > 0) {
      return handleFetch(url, options, timeout, retries - 1);
    }

    if (err.name === "AbortError") {
      throw new Error("Request took too long. Server is processing...");
    }

    if (err.message === "Failed to fetch") {
      throw new Error("Network issue. Please check connection.");
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
  if (!data.contact_email?.includes("@"))
    throw new Error("Invalid email address");

  const rssUrl = (data.rss_url || "").trim();
  const urlPattern = /^https?:\/\/\S+$/i;

  if (!rssUrl || !urlPattern.test(rssUrl))
    throw new Error("Invalid RSS URL");

  if (data.notes && data.notes.length > 500)
    throw new Error("Notes too long");

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanBody),
    });
  } finally {
    if (onSubmitting) onSubmitting(false);
  }
};

export const fetchPendingSubmissions = () =>
  handleFetch(`${API_BASE}/submissions/pending`);

export const fetchSubmissionDetails = (id) =>
  handleFetch(`${API_BASE}/submissions/${encodeURIComponent(id)}`);

export const approveSubmission = (id) =>
  handleFetch(`${API_BASE}/admin/approve/${encodeURIComponent(id)}`, {
    method: "POST",
  });

export const rejectSubmission = (id) =>
  handleFetch(`${API_BASE}/admin/reject/${encodeURIComponent(id)}`, {
    method: "POST",
  });

let podcastsCache = null;
let podcastsLastFetch = 0;
const PODCAST_CACHE_TTL = 30000;

export const fetchPodcasts = async () => {
  const now = Date.now();

  if (podcastsCache && now - podcastsLastFetch < PODCAST_CACHE_TTL) {
    return podcastsCache;
  }

  const data = await handleFetch(`${API_BASE}/podcasts`);

  podcastsCache = data;
  podcastsLastFetch = now;

  return data;
};

export const fetchPodcast = (id) =>
  handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(id)}`);

export const checkHealth = (id) =>
  handleFetch(
    `${API_BASE}/podcasts/${encodeURIComponent(id)}/check-health`,
    {
      method: "POST",
    }
  );

export const fetchEpisodes = (id) =>
  handleFetch(`${API_BASE}/podcasts/${encodeURIComponent(id)}/episodes`);