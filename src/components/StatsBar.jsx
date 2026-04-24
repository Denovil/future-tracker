import React from "react";
import { getPriceValue } from "../utils/marketplace";

export default function StatsBar({ features }) {
  const total = features.length;
  const available = features.filter((f) => f.status !== "Completed").length;
  const priced = features.filter((f) => getPriceValue(f) != null).length;
  const withPhotos = features.filter(
    (f) => Boolean(f.image || f.imageUrl || (Array.isArray(f.imageClips) && f.imageClips.length > 0))
  ).length;

  const stats = [
    { label: "Total Listings", value: total, icon: "inventory_2", tone: "total" },
    { label: "Available", value: available, icon: "check_circle", tone: "available" },
    { label: "Priced", value: priced, icon: "payments", tone: "priced" },
    { label: "With Photos", value: withPhotos, icon: "photo_camera", tone: "photos" },
  ];

  return (
    <section className="market-stats" aria-label="Marketplace summary">
      {stats.map((stat) => (
        <div key={stat.label} className={`market-stat-item market-stat-item--${stat.tone}`}>
          <div className="market-stat-head">
            <span className="market-stat-icon material-symbols-rounded" aria-hidden="true">
              {stat.icon}
            </span>
            <span className="market-stat-label">{stat.label}</span>
          </div>
          <span className="market-stat-value">{stat.value}</span>
        </div>
      ))}
    </section>
  );
}
