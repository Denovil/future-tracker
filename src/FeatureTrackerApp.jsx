// src/FeatureTrackerApp.jsx — Clean Feature Request Tracker (User Interface)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./components/FeatureCard";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import StatsBar from "./components/StatsBar";
import { API_URL } from "./utils/api";

export default function FeatureTrackerApp({ features: propsFeatures, loading: propsLoading }) {
  const navigate = useNavigate();
  const [features, setFeatures] = useState(propsFeatures || []);
  const [loading, setLoading] = useState(propsLoading !== undefined ? propsLoading : true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  // Fetch features from backend if not provided
  useEffect(() => {
    if (propsFeatures) {
      setFeatures(propsFeatures);
      setLoading(false);
    } else {
      const fetchFeatures = () => {
        setLoading(true);
        setError(null);
        axios.get(API_URL)
          .then(res => setFeatures(res.data))
          .catch(() => setError("Failed to load features. Please try again."))
          .finally(() => setLoading(false));
      };
      fetchFeatures();
    }
  }, [propsFeatures]);

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

  // Handle feature click - navigate to details page
  const handleViewDetails = (feature) => {
    navigate(`/feature/${feature.id}`);
  };

  return (
    <>
      <div className="app">
      {/* ── Adaptive Background ── */}
      <div className={`adaptive-bg filter-${filter.toLowerCase().replace(/\s+/g, '-')}`} />

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
            onClick={() => window.location.reload()}
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
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>


    </>
  );
}
