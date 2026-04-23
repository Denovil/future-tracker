import React from "react";
import { toApiAssetUrl, toFeatureImageUrl } from "../utils/api";
import { getDisplayPrice } from "../utils/marketplace";

const resolveImage = (feature) => {
  if (feature.image) return toFeatureImageUrl(feature.image);
  if (feature.imageUrl) {
    if (/^https?:\/\//i.test(feature.imageUrl)) return feature.imageUrl;
    return toApiAssetUrl(feature.imageUrl);
  }
  return null;
};

export default function FeatureCard({ feature, onViewDetails }) {
  const imageUrl = resolveImage(feature);
  const handleOpen = () => onViewDetails(feature);

  return (
    <article
      className="market-card"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${feature.title}`}
    >
      <div className="market-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={feature.title} loading="lazy" />
        ) : (
          <div className="market-card-placeholder">No photo available</div>
        )}
      </div>

      <div className="market-card-body">
        <h3 className="market-card-title">{feature.title}</h3>
        <p className="market-card-price">{getDisplayPrice(feature)}</p>
      </div>
    </article>
  );
}
