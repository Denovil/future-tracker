import React from "react";
import { getPriceValue } from "../utils/marketplace";

export default function StatsBar({ features }) {
  const total = features.length;
  const available = features.filter((f) => f.status !== "Completed").length;
  const priced = features.filter((f) => getPriceValue(f) != null).length;
  const withPhotos = features.filter((f) => Boolean(f.image || f.imageUrl)).length;

  const stats = [
    { label: "Total Listings", value: total },
    { label: "Available", value: available },
    { label: "Priced", value: priced },
    { label: "With Photos", value: withPhotos },
  ];

  return (
    <section className="market-stats" aria-label="Marketplace summary">
      {stats.map((stat) => (
        <div key={stat.label} className="market-stat-item">
          <span className="market-stat-value">{stat.value}</span>
          <span className="market-stat-label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
