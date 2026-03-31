// This file has been moved to src/.
export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Open", "In Progress", "Completed"];

export const PRIORITY_META = {
  Low:    { label: "Low",    color: "var(--c-low)" },
  Medium: { label: "Medium", color: "var(--c-medium)" },
  High:   { label: "High",   color: "var(--c-high)" },
};

export const STATUS_META = {
  Open:        { label: "Open",        icon: "◎" },
  "In Progress": { label: "In Progress", icon: "◑" },
  Completed:   { label: "Completed",   icon: "●" },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}