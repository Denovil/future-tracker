const resolveApiOrigin = () => {
  const configuredOrigin = process.env.REACT_APP_API_ORIGIN;
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
    ) {
      return "http://localhost:5000";
    }

    return origin.replace(/\/$/, "");
  }

  return "http://localhost:5000";
};

export const API_ORIGIN = resolveApiOrigin();
export const API_URL = `${API_ORIGIN}/api/features`;

export const toApiAssetUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};

export const toFeatureImageUrl = (imageName) => {
  if (!imageName) return imageName;
  return `${API_URL}/images/${imageName}`;
};
