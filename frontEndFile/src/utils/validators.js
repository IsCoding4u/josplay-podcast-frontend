export const validateRSS = (url) => {
  if (!url) return "RSS feed required";

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Invalid RSS URL";
    }

    if (url.toLowerCase().includes("<script>") || url.toLowerCase().includes("javascript:")) {
      return "Malicious input detected";
    }

    return null;
  } catch {
    return "Invalid RSS URL";
  }
};