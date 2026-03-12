import { useState } from "react";
import { submitPodcast } from "../services/api";

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    rss_url: "",
    contact_email: "",
    podcast_name: "",
    country: "",
    language: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await submitPodcast(formData);
      alert(res.message || "Submission successful!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="rss_url" placeholder="RSS URL" onChange={handleChange} required />
      <input name="contact_email" placeholder="Email" type="email" onChange={handleChange} required />
      <input name="podcast_name" placeholder="Podcast Name" onChange={handleChange} />
      <input name="country" placeholder="Country" onChange={handleChange} />
      <input name="language" placeholder="Language" onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" onChange={handleChange}></textarea>
      <button type="submit">Submit Podcast</button>
    </form>
  );
}