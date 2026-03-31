// src/App.jsx — User-facing view (read-only)
import React, { useState, useEffect } from "react";
import axios from "axios";
import FeatureCard from "./components/FeatureCard";
import FeatureModal from "./components/FeatureModal";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import StatsBar from "./components/StatsBar";

const API_URL = "http://localhost:5000/api/features";

export default function App() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Fetch features from backend
  const fetchFeatures = () => {
    setLoading(true);
    setError(null);
    axios.get(API_URL)
      .then(res => setFeatures(res.data))
      .catch(() => setError("Failed to load features. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeatures(); }, []);

  // Counts per status for FilterBar
  const counts = {
    Open:        features.filter(f => f.status === "Open").length,
    "In Progress": features.filter(f => f.status === "In Progress").length,
    Completed:   features.filter(f => f.status === "Completed").length,
  };

  // Filtered list
  const filtered = filter === "All"
    ? features
    : features.filter(f => f.status === filter);

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div>
          <h1 className="app-title">Feature Tracker</h1>
          <p className="app-subtitle">Browse and explore submitted feature requests</p>
        </div>
      </header>

      {/* ── Stats bar ── */}
      <StatsBar features={features} />

      {/* ── Filter bar ── */}
      <div className="toolbar">
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* ── Content ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-3)" }}>
          Loading features…
        </div>
      )}

      {error && (
        <div style={{
          textAlign: "center", padding: 40,
          color: "var(--c-high)", fontSize: 14,
        }}>
          {error}
          <br />
          <button
            className="btn btn-ghost"
            onClick={fetchFeatures}
            style={{ marginTop: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState filter={filter} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="cards-grid">
          {filtered.map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onViewDetails={setSelectedFeature}
            />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}

    </div>
  );
}