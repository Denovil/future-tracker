// Read-only hook — data comes from the backend API (see App.jsx).
// Add / update / delete are handled by the admin interface only.

export function useFeatures() {
  // No local state or mutations needed in the user-facing view.
  // App.jsx fetches directly via axios and manages its own state.
  return {};
}