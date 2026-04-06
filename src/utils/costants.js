// This file has been moved to src/.
export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Open", "In Progress", "Completed"];

export const PRIORITY_META = {
  Low:    { label: "Low Priority",    color: "#10B981", icon: "◯" },
  Medium: { label: "Medium Priority", color: "#F59E0B", icon: "◐" },
  High:   { label: "High Priority",   color: "#EF4444", icon: "●" },
};

export const STATUS_META = {
  Open:        { label: "Not Started",    icon: "◎", color: "#3B82F6" },
  "In Progress": { label: "In Development", icon: "◑", color: "#8B5CF6" },
  Completed:   { label: "Completed",     icon: "●", color: "#10B981" },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}