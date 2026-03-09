import React from "react";
import "./dashboard.module.css";

const Dashboard = () => {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div className="logo">
          🎙 <span>JOSPLAY</span>
        </div>
        <h1>Podcast Dashboard</h1>
      </div>

      <div className="upload-section">
        <h2>Upload Podcast</h2>

        <input
          type="text"
          placeholder="Podcast Title"
        />

        <textarea
          placeholder="Podcast Description"
        />

        <button className="submit-btn">
          Submit Podcast
        </button>
      </div>

      <div className="podcast-list">
        <h2>Episodes</h2>

        <div className="podcast-grid">

          <div className="podcast-card">
            <h3>Tech Talk</h3>
            <p>Discussing AI trends</p>
          </div>

          <div className="podcast-card">
            <h3>Startup Stories</h3>
            <p>Founders share experiences</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;