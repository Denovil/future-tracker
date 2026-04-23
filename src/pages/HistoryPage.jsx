import React from "react";
import { useFeatures } from "../hooks/useFeature";

export default function HistoryPage() {
  const { features } = useFeatures();

  return (
    <div className="history-page" style={{ maxWidth: 900, margin: "40px auto", background: "rgba(22,24,28,0.85)", borderRadius: 12, padding: 32 }}>
      <button
        onClick={() => {
          window.history.pushState({}, '', '/');
          if (window.setAppRoute) window.setAppRoute('main');
        }}
        style={{
          marginBottom: 24,
          padding: '8px 20px',
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 8,
          border: 'none',
          background: 'var(--accent, #6c63ff)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        ← Back
      </button>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 24 }}>Feature Request History</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
        <thead>
          <tr style={{ background: "#23263a" }}>
            <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--accent)", fontWeight: 700 }}>Title</th>
            <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--accent)", fontWeight: 700 }}>Description</th>
            <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--accent)", fontWeight: 700 }}>Status</th>
            <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--accent)", fontWeight: 700 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {features.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-2)", padding: 24 }}>No history found.</td></tr>
          ) : (
            features.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 8px", color: "var(--text)" }}>{f.title}</td>
                <td style={{ padding: "10px 8px", color: "var(--text-2)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.description}</td>
                <td style={{ padding: "10px 8px", color: "var(--text)" }}>{f.status}</td>
                <td style={{ padding: "10px 8px", color: "var(--text-3)", whiteSpace: 'pre-line' }}>{
                  (() => {
                    const d = new Date(f.createdAt);
                    const day = d.toLocaleDateString("en-US", { weekday: "long" });
                    const date = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    return `${day}\n${date}\n${time}`;
                  })()
                }</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
