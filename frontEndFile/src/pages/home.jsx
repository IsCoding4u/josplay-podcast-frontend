// src/pages/home.jsx
import React from "react";
import FeedForm from "../components/feeds/FeedForm";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit Your Podcast</h1>
        <p className={styles.subtitle}>
          Enter your podcast details below. Our admin team will review and approve
          your podcast before it goes live on the platform.
        </p>
      </div>

      <section className={styles.formSection}>
        <FeedForm />
      </section>
    </main>
  );
}