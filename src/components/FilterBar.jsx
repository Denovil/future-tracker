import React from "react";
import { STATUSES } from "../utils/constants";

const ALL = "All";
const TABS = [ALL, ...STATUSES];

export default function FilterBar({ active, onChange, counts }) {
  return (
    <nav className="market-filter-bar" aria-label="Filter by listing status">
      {TABS.map((tab) => {
        const count = tab === ALL
          ? Object.values(counts).reduce((sum, value) => sum + value, 0)
          : (counts[tab] ?? 0);

        return (
          <button
            key={tab}
            type="button"
            className={`market-filter-tab ${active === tab ? "active" : ""}`}
            onClick={() => onChange(tab)}
            aria-pressed={active === tab}
          >
            <span>{tab}</span>
            <span className="market-filter-count">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}
