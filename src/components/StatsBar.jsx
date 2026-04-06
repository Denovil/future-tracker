// This file has been moved to src/.
import React from "react";

export default function StatsBar({ features }) {
  const total = features.length;
  const open = features.filter((f) => f.status === "Open").length;
  const inProgress = features.filter((f) => f.status === "In Progress").length;
  const completed = features.filter((f) => f.status === "Completed").length;
  const highPriority = features.filter((f) => f.priority === "High").length;

  const stats = [
    { label: "All Requests", value: total, accent: false },
    { label: "Not Started", value: open, accent: "open" },
    { label: "In Development", value: inProgress, accent: "progress" },
    { label: "Completed", value: completed, accent: "done" },
    { label: "High Priority", value: highPriority, accent: "high" },
  ];

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className={`stat-item ${s.accent ? `stat-${s.accent}` : ""}`}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}