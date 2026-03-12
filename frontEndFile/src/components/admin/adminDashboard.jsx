import { useState } from "react";
import PropTypes from "prop-types";
import Button from "../ui/Button/button";
import styles from "./admin.module.css";

export default function AdminDashboard({ pendingSubmissions = [], onApprove, onReject }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (uuid) => {
    if (loadingId) return; // idempotency guard
    setLoadingId(uuid);
    try {
      await onApprove(uuid);
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (uuid) => {
    if (loadingId) return;
    setLoadingId(uuid);
    try {
      await onReject(uuid);
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Admin Dashboard</h2>
      {pendingSubmissions.length === 0 ? (
        <p className={styles.empty}>No pending submissions</p>
      ) : (
        <div className={styles.list}>
          {pendingSubmissions.map((sub) => (
            <div key={sub.uuid} className={styles.card}>
              <h3 className={styles.cardTitle}>
                {sub.podcast_name || "Unnamed Podcast"}
              </h3>
              <p className={styles.cardDesc}>
                {sub.notes || "No notes provided"}
              </p>
              <p className={styles.email}>Email: {sub.contact_email}</p>
              <div className={styles.actions}>
                <Button
                  text="Approve"
                  variant="success"
                  disabled={loadingId === sub.uuid}
                  onClick={() => handleApprove(sub.uuid)}
                />
                <Button
                  text="Reject"
                  variant="danger"
                  disabled={loadingId === sub.uuid}
                  onClick={() => handleReject(sub.uuid)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

AdminDashboard.propTypes = {
  pendingSubmissions: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      podcast_name: PropTypes.string,
      notes: PropTypes.string,
      contact_email: PropTypes.string.isRequired,
    })
  ),
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};