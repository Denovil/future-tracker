import React, { useState } from "react";

const ADMIN_KEY = "admin-authenticated";

export default function AdminToggle({ onEnterAdmin }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem(ADMIN_KEY, "true");
      setError("");
      setShowPrompt(false);
      setUsername("");
      setPassword("");
      onEnterAdmin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPrompt(true)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--accent)",
          border: "none",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        title="Admin Access"
      >
        ⚙️
      </button>

      {showPrompt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}>
          <div style={{
            background: "var(--surface)",
            padding: 32,
            borderRadius: "var(--radius)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: 320,
            width: "90%",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>
              Admin Login
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 500 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 500 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {error && (
                <div style={{ color: "var(--c-high)", fontSize: 12 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}
