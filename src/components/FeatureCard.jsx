import React from "react";
import ImageCarousel from "./ImageCarousel";
import { getFeatureImageSources } from "../utils/featureImages";
import { getDisplayPrice } from "../utils/marketplace";

export default function FeatureCard({ feature, onViewDetails }) {
  const images = getFeatureImageSources(feature);
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
        {images.length > 0 ? (
          <ImageCarousel
            images={images}
            alt={feature.title}
            autoPlay={images.length > 1}
            intervalMs={3200}
            fit="contain"
          />
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
