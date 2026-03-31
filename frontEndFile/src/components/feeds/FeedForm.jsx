import React, { useState, useRef } from "react";
import styles from "./feedform.module.css";
import Button from "../ui/Button/button";
import { submitPodcast } from "../../services/api";

export default function FeedForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    rss_url: "",
    contact_email: "",
    country: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await submitPodcast(form);
      alert(`${res.message || "Podcast submitted successfully"}\nEpisodes Found: ${res.episodes_found}`);
      setForm({
        first_name: "",
        last_name: "",
        rss_url: "",
        contact_email: "",
        country: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      if (err.status === 409) alert("This RSS feed has already been submitted or approved.");
      else if (err.status === 400) alert("Invalid submission: Check your RSS feed URL.");
      else if (err.status === 408) alert("Request timed out. Try again later.");
      else alert(`Submission failed: ${err.message}`);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="rss_url"
          placeholder="RSS Feed URL"
          value={form.rss_url}
          onChange={handleChange}
          required
        />
        <input
          name="contact_email"
          type="email"
          placeholder="Email"
          value={form.contact_email}
          onChange={handleChange}
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder="Additional Notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <div className={styles.buttonContainer}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit Podcast"}
        </Button>
      </div>
    </form>
  );
}