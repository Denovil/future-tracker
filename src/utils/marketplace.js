const PRICE_PATTERNS = [
  /(?:price|ksh|kes|tzs|tsh|usd|\$)\s*[:=-]?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i,
  /([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:ksh|kes|tzs|tsh|usd)/i,
];

const parseNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const clean = value.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  if (!clean) return null;

  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getPriceValue = (feature) => {
  const direct = parseNumber(feature?.price ?? feature?.amount);
  if (direct != null) return direct;

  const text = [feature?.title, feature?.description].filter(Boolean).join(" ");
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const parsed = parseNumber(match[1]);
    if (parsed != null) return parsed;
  }

  return null;
};

export const getDisplayPrice = (feature) => {
  const value = getPriceValue(feature);
  if (value == null) return "Ask for price";

  return `TZS ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
};

export const getSecondaryPriceHint = (feature) => {
  if (feature?.priceNote) return feature.priceNote;
  if (getPriceValue(feature) == null) return "Negotiable";
  return "Ready for delivery";
};

export const getSellerName = (feature) => {
  return feature?.sellerName || feature?.seller || "Verified spare seller";
};

export const getListingLocation = (feature) => {
  return feature?.location || "Location not specified";
};
