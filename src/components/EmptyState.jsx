import React from "react";

export default function EmptyState({ filter, searchQuery, onReset }) {
  const isFiltered = filter !== "All" || Boolean(searchQuery?.trim());

  return (
    <div className="market-empty-state">
      <h3>No spare parts found</h3>
      <p>
        {isFiltered
          ? "Try another search or reset your filters to see more listings."
          : "There are no listings yet. Add your first spare part from the admin dashboard."}
      </p>
      {isFiltered && (
        <button type="button" className="marketplace-reset" onClick={onReset}>
          Reset filters
        </button>
      )}
    </div>
  );
}
