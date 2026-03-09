// src/pages/Home.jsx
import React, { useState } from "react";
import FeedForm from "../components/feeds/FeedForm";

const Home = () => {
  return (
    <div className="home-page">
      <h1>Submit Your Podcast</h1>
      <p>Enter your podcast details below. Admin will approve it before it goes live.</p>

      {/* Using a placeholder form component */}
      <FeedForm />
    </div>
  );
};

export default Home;