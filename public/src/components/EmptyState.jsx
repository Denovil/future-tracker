// This file has been moved to src/.
import React from "react";

export default function EmptyState({ filter, onAdd }) {
  const isFiltered = filter !== "All";
  return (
    <div className="empty-state">
      <div className="empty-icon">{isFiltered ? "◎" : "✦"}</div>
      <h3>{isFiltered ? `No "${filter}" requests` : "No feature requests yet"}</h3>
      <p>
        {isFiltered
          ? "Try a different filter or add a new request."
          : "Start tracking your feature ideas — add the first one."}
      </p>
      {!isFiltered && (
        <button className="btn btn-primary" onClick={onAdd}>
          Add First Request
        </button>
      )}
    </div>
  );
}