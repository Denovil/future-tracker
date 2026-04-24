import { toApiAssetUrl, toFeatureImageUrl } from "./api";

const toSafeAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return toApiAssetUrl(value);
};

export const getFeatureImageSources = (feature) => {
  if (!feature) return [];

  const images = [];
  const seen = new Set();

  const addImage = (url, title) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    images.push({ url, title: title || "Listing image" });
  };

  if (feature.image) {
    const imageValue = String(feature.image);
    const primaryImageUrl = imageValue.includes("/")
      ? toSafeAssetUrl(imageValue)
      : toFeatureImageUrl(imageValue);
    addImage(primaryImageUrl, feature.imageTitle || feature.title);
  }

  if (feature.imageUrl) {
    addImage(toSafeAssetUrl(feature.imageUrl), feature.imageTitle || feature.title);
  }

  if (Array.isArray(feature.imageClips)) {
    feature.imageClips.forEach((clip, index) => {
      const clipUrl =
        toSafeAssetUrl(clip?.filePath) ||
        (clip?.fileName ? toFeatureImageUrl(clip.fileName) : null) ||
        toSafeAssetUrl(clip?.url) ||
        toSafeAssetUrl(clip?.imageUrl) ||
        toSafeAssetUrl(clip?.src) ||
        toSafeAssetUrl(clip?.path);
      addImage(clipUrl, clip?.title || `Image ${index + 1}`);
    });
  }

  return images;
};

export const getPrimaryFeatureImage = (feature) => {
  return getFeatureImageSources(feature)[0]?.url || null;
};
