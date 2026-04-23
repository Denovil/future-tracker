export const PRIORITIES = ["Low", "Medium", "High"];

export const STATUS_ALIASES = {
  Open: "Available",
};

export const normalizeStatus = (status) => STATUS_ALIASES[status] || status || "";

export const STATUSES = ["Available", "In Progress", "Completed"];

export const PRIORITY_META = {
  Low: { label: "Low Priority", color: "#10B981", icon: "O" },
  Medium: { label: "Medium Priority", color: "#F59E0B", icon: "~" },
  High: { label: "High Priority", color: "#EF4444", icon: "!" },
};

const AVAILABLE_META = { label: "Available", icon: "O", color: "#3B82F6" };

export const STATUS_META = {
  Available: AVAILABLE_META,
  Open: AVAILABLE_META,
  "In Progress": { label: "In Development", icon: "~", color: "#8B5CF6" },
  Completed: { label: "Completed", icon: "OK", color: "#10B981" },
};

export const getStatusMeta = (status) =>
  STATUS_META[normalizeStatus(status)] || STATUS_META.Available;

export const getStatusLabel = (status) => normalizeStatus(status) || "Available";

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
