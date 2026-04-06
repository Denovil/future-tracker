import React, { useState, useEffect } from "react";
import { PRIORITY_META, STATUS_META } from "../utils/constants";

export default function FeatureModal({ feature, onClose }) {
  const [viewFullImage, setViewFullImage] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (viewFullImage) setViewFullImage(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, viewFullImage]);

  if (!feature) return null;

  const pm = PRIORITY_META[feature.priority];
  const sm = STATUS_META[feature.status];

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Feature Details"
        >
          {/* ── Header ── */}
          <div className="modal-header">
            <h2 className="modal-title">Request Details</h2>
            <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Title ── */}
            <div className="field">
              <label>Title</label>
              <div style={{
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
              }}>
                {feature.title}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="field">
              <label>Description</label>
              <div style={{
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-2)",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                minHeight: 80,
              }}>
                {feature.description}
              </div>
            </div>

            {/* ── Priority & Status ── */}
            <div className="field-row">
              <div className="field">
                <label>Priority</label>
                <div style={{
                  padding: "8px 14px",
                  background: "var(--surface-2)",
                  border: `1px solid ${pm?.color || "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  color: pm?.color || "var(--text)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}>
                  {feature.priority}
                </div>
              </div>

              <div className="field">
                <label>Status</label>
                <div style={{
                  padding: "8px 14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span>{sm?.icon}</span>
                  {feature.status}
                </div>
              </div>
            </div>

            {/* ── Image ── */}
            {feature.imageUrl && (
              <div className="field">
                <label>Image</label>
                <div style={{ position: "relative" }}>
                  <img
                    src={feature.imageUrl}
                    alt="Feature image"
                    onClick={() => setViewFullImage(true)}
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: 260,
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      cursor: "zoom-in",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    title="Click to view full size"
                  />
                  <div style={{
                    position: "absolute", bottom: 8, right: 10,
                    fontSize: 11, color: "var(--text-3)",
                    background: "rgba(0,0,0,0.5)",
                    padding: "2px 8px", borderRadius: 4,
                  }}>
                    🔍 Click to enlarge
                  </div>
                </div>
              </div>
            )}

            {/* ── GPS Location ── */}
            {feature.coordinates && (
              <div className="field">
                <label>GPS Location</label>
                <div style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>
                    <div><strong>Lat:</strong> {feature.coordinates.latitude.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {feature.coordinates.longitude.toFixed(6)}</div>
                    {feature.coordinates.accuracy && (
                      <div style={{ color: "var(--text-3)" }}>
                        Accuracy: ±{feature.coordinates.accuracy.toFixed(0)}m
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Submitted date ── */}
            {feature.createdAt && (
              <div className="field">
                <label>Submitted</label>
                <div style={{
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-3)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                }}>
                  📅 {new Date(feature.createdAt).toLocaleString()}
                </div>
              </div>
            )}

            {/* ── Close ── */}
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Full-size image lightbox ── */}
      {viewFullImage && feature.imageUrl && (
        <div
          onClick={() => setViewFullImage(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, cursor: "zoom-out",
            backdropFilter: "blur(6px)",
          }}
        >
          <button
            onClick={() => setViewFullImage(false)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 40, height: 40,
              fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          <img
            src={feature.imageUrl}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "90vh",
              objectFit: "contain", borderRadius: 8,
              boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
              cursor: "default",
            }}
          />
        </div>
      )}
    </>
  );
}