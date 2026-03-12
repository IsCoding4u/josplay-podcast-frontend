export const validateRSS = (url) => {
  if (!url || typeof url !== "string") {
    return "RSS feed required";
  }

  const trimmedUrl = url.trim();

  try {
    const parsed = new URL(trimmedUrl);

    // Allow only HTTP or HTTPS
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP or HTTPS RSS feeds are allowed";
    }

    // Basic malicious pattern check
    const lower = trimmedUrl.toLowerCase();
    const maliciousPatterns = ["<script", "javascript:", "data:", "vbscript:"];

    if (maliciousPatterns.some((pattern) => lower.includes(pattern))) {
      return "Malicious input detected";
    }

    // Optional: ensure it looks like an RSS feed
    if (
      !trimmedUrl.endsWith(".xml") &&
      !trimmedUrl.includes("rss") &&
      !trimmedUrl.includes("feed")
    ) {
      return "URL does not appear to be an RSS feed";
    }

    return null;
  } catch (error) {
    return "Invalid RSS URL";
  }
};