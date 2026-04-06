// This file has been moved to src/.

import React from "react";
import { STATUSES, STATUS_META } from "../utils/costants";

const ALL = "All";
const TABS = [ALL, ...STATUSES];

export default function FilterBar({ active, onChange, counts }) {
  return (
    <nav className="filter-bar" aria-label="Filter by status">
      {TABS.map((tab) => {
        const count = tab === ALL
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[tab] ?? 0);
        return (
          <button
            key={tab}
            className={`filter-tab ${active === tab ? "active" : ""}`}
            onClick={() => onChange(tab)}
            aria-pressed={active === tab}
          >
            {tab !== ALL && (
              <span className="tab-icon">{STATUS_META[tab]?.icon}</span>
            )}
            {tab}
            <span className="tab-count">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}