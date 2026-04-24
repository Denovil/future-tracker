import React, { useEffect } from "react";
import { getStatusLabel, getStatusMeta } from "../utils/constants";
import ImageCarousel from "./ImageCarousel";
import { getFeatureImageSources } from "../utils/featureImages";

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

  const statusInfo = getStatusMeta(feature.status);
  const statusLabel = getStatusLabel(feature.status);
  const images = getFeatureImageSources(feature);

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
              {statusInfo.icon} {statusLabel}
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
                {statusInfo.icon} {statusLabel}
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
          {images.length > 0 && (
            <div className="section">
              <h3 className="section-title">Screenshot</h3>
              <div className="image-display">
                <ImageCarousel
                  images={images}
                  alt={feature.imageTitle || feature.title}
                  autoPlay={images.length > 1}
                  intervalMs={4200}
                  fit="contain"
                  containerStyle={{ width: "100%", height: "280px", borderRadius: "8px" }}
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
