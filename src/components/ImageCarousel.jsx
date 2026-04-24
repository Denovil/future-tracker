import React, { useEffect, useState } from "react";

const arrowButtonBase = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "30px",
  height: "30px",
  borderRadius: "999px",
  border: "none",
  background: "rgba(17, 24, 39, 0.58)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: 1,
  zIndex: 2,
};

export default function ImageCarousel({
  images = [],
  alt = "Image",
  autoPlay = true,
  intervalMs = 3600,
  fit = "contain",
  containerStyle,
  imageStyle,
}) {
  const [index, setIndex] = useState(0);
  const imageCount = images.length;

  useEffect(() => {
    setIndex((prev) => (prev < imageCount ? prev : 0));
  }, [imageCount]);

  useEffect(() => {
    if (!autoPlay || imageCount < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, intervalMs, imageCount]);

  if (imageCount === 0) return null;

  const goPrevious = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const goNext = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((prev) => (prev + 1) % imageCount);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...containerStyle,
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${imageCount * 100}%`,
          height: "100%",
          transform: `translateX(-${(index * 100) / imageCount}%)`,
          transition: "transform 0.55s ease",
        }}
      >
        {images.map((image, imageIndex) => (
          <div
            key={`${image.url}-${imageIndex}`}
            style={{
              width: `${100 / imageCount}%`,
              height: "100%",
              flexShrink: 0,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={image.url}
              alt={image.title || alt}
              loading={imageIndex === 0 ? "eager" : "lazy"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: fit,
                display: "block",
                ...imageStyle,
              }}
            />
          </div>
        ))}
      </div>

      {imageCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={goPrevious}
            style={{ ...arrowButtonBase, left: "10px" }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={goNext}
            style={{ ...arrowButtonBase, right: "10px" }}
          >
            ›
          </button>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "10px",
              transform: "translateX(-50%)",
              zIndex: 2,
              background: "rgba(17, 24, 39, 0.6)",
              color: "#ffffff",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 8px",
            }}
          >
            {index + 1}/{imageCount}
          </div>
        </>
      )}
    </div>
  );
}

