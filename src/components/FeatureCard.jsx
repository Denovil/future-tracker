import React from "react";
import { PRIORITY_META, STATUS_META, formatDate } from "../utils/costants";
import { toFeatureImageUrl } from "../utils/api";

export default function FeatureCard({ feature, onViewDetails }) {
  const pm = PRIORITY_META[feature.priority];
  const sm = STATUS_META[feature.status];
  const description = feature.description || "";
  const shouldTruncate = description.length > 150;
  const truncatedDescription = shouldTruncate
    ? `${description.slice(0, 150).trim()}...`
    : description;

  const resourceSummary = [
    feature.videos?.length ? `${feature.videos.length} video${feature.videos.length > 1 ? "s" : ""}` : null,
    feature.videoFiles?.length ? `${feature.videoFiles.length} clip${feature.videoFiles.length > 1 ? "s" : ""}` : null,
    feature.imageClips?.length ? `${feature.imageClips.length} image${feature.imageClips.length > 1 ? "s" : ""}` : null,
    feature.links?.length ? `${feature.links.length} link${feature.links.length > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return (
    <article
      className={`card status-${feature.status.replace(" ", "-").toLowerCase()}`}
      onClick={() => onViewDetails(feature)}
      style={{ cursor: "pointer" }}
    >
      <h3 className="card-title">{feature.title}</h3>

      {(feature.image || feature.imageUrl) && (
        <div style={{ margin: "12px 0", textAlign: "center" }}>
          <img
            src={feature.image ? toFeatureImageUrl(feature.image) : feature.imageUrl}
            alt={feature.imageTitle || feature.title}
            style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          />
          {feature.imageTitle && (
            <div style={{ marginTop: "8px", textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>
                {feature.imageTitle}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card-info-section">
        <div className="info-row">
          <span className="info-label">Priority:</span>
          <span className="priority-badge" style={{ "--badge-color": pm.color }}>
            {pm.label}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Status:</span>
          <span
            className={`status-badge status-${feature.status.replace(" ", "-").toLowerCase()}`}
            title={sm.label}
          >
            <span className="status-icon">{sm.icon}</span>
            {sm.label}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Submitted:</span>
          <span className="info-value">{formatDate(feature.createdAt)}</span>
        </div>
      </div>

      <div className="card-divider"></div>

      <div className="card-desc-section">
        <p className="card-desc-label">Description:</p>
        <div className="card-desc-wrapper" title={shouldTruncate ? description : ""}>
          <p className={`card-desc ${shouldTruncate ? "truncated" : ""}`}>
            {truncatedDescription}
          </p>
        </div>
      </div>

      {resourceSummary.length > 0 && (
        <div className="card-media-section">
          <p className="card-media-label">Resources</p>
          <div className="card-summary-tags">
            {resourceSummary.map((item) => (
              <span key={item} className="card-summary-tag">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card-footer">
        <button
          className="btn btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(feature);
          }}
          title="View full details"
          style={{ marginLeft: "auto" }}
        >
          View →
        </button>
      </div>
    </article>
  );
}
