

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";


async function handleFetch(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        `Request failed (${res.status})`
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
}



function validateSubmission(data) {
  if (!data) throw new Error("No data provided");

  if (!data.first_name?.trim())
    throw new Error("First name is required");

  if (!data.last_name?.trim())
    throw new Error("Last name is required");

  if (!data.contact_email?.includes("@"))
    throw new Error("Invalid email address");

  const rssUrl = (data.rss_url || "").trim();
  const urlPattern = /^https?:\/\/\S+$/i; // allows http:// or https://
  if (!rssUrl || !urlPattern.test(rssUrl)) {
    const err = new Error("Invalid RSS URL");
    err.status = 400;
    throw err;
  }

  if (data.notes && data.notes.length > 500)
    throw new Error("Notes too long");

  return true;
}



export async function submitPodcast(data, onSubmitting = null) {
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
}

export async function fetchPendingSubmissions() {
  return handleFetch(`${API_BASE}/submissions/pending`);
}


export async function fetchSubmissionDetails(submissionId) {
  if (!submissionId) {
    throw new Error("Submission ID is required");
  }

  return handleFetch(
    `${API_BASE}/submissions/${encodeURIComponent(submissionId)}`
  );
}



export async function approveSubmission(submissionId) {
  if (!submissionId) {
    throw new Error("Submission ID is required");
  }

  return handleFetch(
    `${API_BASE}/admin/approve/${encodeURIComponent(submissionId)}`,
    { method: "POST" }
  );
}

export async function rejectSubmission(submissionId) {
  if (!submissionId) {
    throw new Error("Submission ID is required");
  }

  return handleFetch(
    `${API_BASE}/admin/reject/${encodeURIComponent(submissionId)}`,
    { method: "POST" }
  );
}


export async function fetchPodcasts() {
  return handleFetch(`${API_BASE}/podcasts`);
}

export async function fetchPodcast(podcastId) {
  if (!podcastId) {
    throw new Error("Podcast ID is required");
  }

  return handleFetch(
    `${API_BASE}/podcasts/${encodeURIComponent(podcastId)}`
  );
}