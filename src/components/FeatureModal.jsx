import React, { useEffect } from "react";
import { STATUS_META } from "../utils/costants";
import { toFeatureImageUrl } from "../utils/api";

export default function FeatureModal({ feature, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!feature) return null;

  const statusInfo = STATUS_META[feature.status] || {};
  const priorityColors = {
    High: "#FF6B6B",
    Medium: "#FFD93D",
    Low: "#6BCB77",
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enhanced" role="dialog" aria-modal="true">
        {/* ── Header with gradient ── */}
        <div
          className="modal-header-enhanced"
          style={{ background: `linear-gradient(135deg, ${statusInfo.color || "#6366f1"}, ${statusInfo.color || "#6366f1"}cc)` }}
        >
          <div style={{ flex: 1 }}>
            <h1 className="modal-title">{feature.title}</h1>
            <p className="modal-subtitle">{feature.description?.substring(0, 100)}...</p>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Content ── */}
        <div className="modal-content-enhanced">
          {/* Badges Row */}
          <div className="badges-row">
            <span className="badge badge-status" style={{ backgroundColor: statusInfo.color }}>
              {statusInfo.icon} {feature.status}
            </span>
            <span className="badge badge-priority" style={{ backgroundColor: priorityColors[feature.priority] }}>
              ◆ {feature.priority} Priority
            </span>
            {feature.submittedDate && (
              <span className="badge badge-date">📅 {feature.submittedDate}</span>
            )}
          </div>

          {/* Description Section */}
          <div className="section">
            <h3 className="section-title">Description</h3>
            <p className="section-content">{feature.description}</p>
          </div>

          {/* Meta Information Grid */}
          <div className="meta-grid">
            <div className="meta-item">
              <label>Status</label>
              <div style={{ padding: "8px 14px", backgroundColor: statusInfo.color + "20", borderRadius: "4px", fontWeight: 600, color: statusInfo.color }}>
                {statusInfo.icon} {feature.status}
              </div>
            </div>
            <div className="meta-item">
              <label>Priority</label>
              <div style={{ padding: "8px 14px", backgroundColor: priorityColors[feature.priority] + "20", borderRadius: "4px", fontWeight: 600, color: priorityColors[feature.priority] }}>
                ◆ {feature.priority}
              </div>
            </div>
            {feature.submittedDate && (
              <div className="meta-item">
                <label>Submitted Date</label>
                <div style={{ padding: "8px 14px", backgroundColor: "#f0f0f0", borderRadius: "4px", fontWeight: 600 }}>
                  📅 {feature.submittedDate}
                </div>
              </div>
            )}
          </div>

          {/* Image if exists */}
          {(feature.image || feature.imageUrl) && (
            <div className="section">
              <h3 className="section-title">Screenshot</h3>
              <div className="image-display">
                <img
                  src={feature.image ? toFeatureImageUrl(feature.image) : feature.imageUrl}
                  alt={feature.imageTitle || feature.title}
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
                {(feature.imageTitle || feature.imageDescription) && (
                  <div style={{ marginTop: "12px" }}>
                    {feature.imageTitle && (
                      <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>{feature.imageTitle}</p>
                    )}
                    {feature.imageDescription && (
                      <p style={{ margin: 0, color: "#666", lineHeight: 1.5 }}>{feature.imageDescription}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location if exists */}
          {feature.gps && (
            <div className="section">
              <h3 className="section-title">Location</h3>
              <div style={{ padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "6px", fontFamily: "monospace" }}>
                {feature.gps}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer-enhanced">
          <button onClick={onClose} className="btn-close-details">
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
