import React from "react";
import { PRIORITY_META, STATUS_META, formatDate } from "../utils/costants";

export default function FeatureCard({ feature, onViewDetails }) {
  const pm = PRIORITY_META[feature.priority];
  const sm = STATUS_META[feature.status];

  return (
    <article 
      className={`card status-${feature.status.replace(" ", "-").toLowerCase()}`}
      onClick={() => onViewDetails(feature)}
      style={{ cursor: "pointer" }}
    >
      <div className="card-top">
        <span className="priority-badge" style={{ "--badge-color": pm.color }}>
          {feature.priority}
        </span>
        <span className="card-date">{formatDate(feature.createdAt)}</span>
      </div>

      {/* Show image if present */}
      {feature.image && (
        <div style={{ margin: '8px 0', textAlign: 'center' }}>
          <img
            src={`http://localhost:5000/api/features/images/${feature.image}`}
            alt={feature.title}
            style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 1px 8px #0001' }}
          />
        </div>
      )}

      <h3 className="card-title">{feature.title}</h3>
      <p className="card-desc">{feature.description}</p>

      <div className="card-footer">
        <span
          className={`status-btn status-${feature.status.replace(" ", "-").toLowerCase()}`}
          title={sm.label}
        >
          <span className="status-icon">{sm.icon}</span>
          {sm.label}
        </span>
      </div>
    </article>
  );
}