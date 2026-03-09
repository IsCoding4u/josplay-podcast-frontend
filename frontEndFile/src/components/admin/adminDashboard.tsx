// src/components/admin/AdminDashboard.tsx
import React from "react";
import Button from "../ui/Button/button"; // adjust path if needed
import "./dashboard.module.css";

// TypeScript types
type Podcast = {
  id: number;
  title: string;
  description: string;
};

type Props = {
  pendingPodcasts: Podcast[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

const AdminDashboard = ({ pendingPodcasts, onApprove, onReject }: Props) => {
  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Dashboard</h2>

      {pendingPodcasts.length === 0 ? (
        <p className="admin-empty">No pending podcasts</p>
      ) : (
        <div className="admin-list">
          {pendingPodcasts.map((podcast) => (
            <div key={podcast.id} className="admin-card">
              <h3 className="admin-card-title">{podcast.title}</h3>
              <p className="admin-card-desc">{podcast.description}</p>

              <div className="admin-card-actions">
                //<Button type="success" onClick={() => onApprove(podcast.id)}>
                  Approve
                </Button>
                <Button type="danger" onClick={() => onReject(podcast.id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;