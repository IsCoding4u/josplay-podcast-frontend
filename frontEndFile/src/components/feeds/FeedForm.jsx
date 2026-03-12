import { useState } from "react";
import styles from "./feedform.module.css";
import { submitPodcast } from "../../services/api";
import Button from "../ui/Button/button";

export default function FeedForm() {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    rss_url: "",
    contact_email: "",
    podcast_name: "",
    country: "",
    language: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await submitPodcast(form);

      console.log("Submission success:", response);

      alert("Podcast submitted successfully");

      setForm({
        first_name: "",
        last_name: "",
        rss_url: "",
        contact_email: "",
        podcast_name: "",
        country: "",
        language: "",
        notes: ""
      });

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
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
          placeholder="Email"
          type="email"
          value={form.contact_email}
          onChange={handleChange}
          required
        />

        <input
          name="podcast_name"
          placeholder="Podcast Name"
          value={form.podcast_name}
          onChange={handleChange}
        />

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
        />

        <input
          name="language"
          placeholder="Language"
          value={form.language}
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

        <Button
          text={loading ? "Submitting..." : "Submit Podcast"}
          type="submit"
          variant="primary"
          disabled={loading}
        />

      </div>

    </form>
  );
}