import React, { useEffect, useState } from "react";

import AdminFeatureModal from "./AdminFeatureModal";
import axios from "axios";


const API_URL = "http://localhost:5000/api/features";
const AUTH_API_URL = "http://localhost:5000/api/auth/login";
const priorities = ["Low", "Medium", "High"];
const statuses = ["Open", "In Progress", "Completed"];

export default function AdminDashboard() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  // Admin login state
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState(null);
  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch features
  const fetchFeatures = () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    axios.get(API_URL)
      .then(res => setFeatures(res.data))
      .catch(err => {
        setError("Failed to fetch features");
        setErrorDetails(err?.message || JSON.stringify(err));
        console.error("Fetch features error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeatures(); }, []);
  // Simple admin login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await axios.post(AUTH_API_URL, loginForm);
      if (res.data && res.data.success) {
        setUser({ username: loginForm.username });
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (err) {
      setLoginError("Invalid credentials");
    }
  };
  const handleLogout = () => {
    setUser(null);
  };

  // Add, edit, delete handlers (implement as needed)
  const handleAdd = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newFeature.title);
      formData.append("description", newFeature.description);
      formData.append("priority", newFeature.priority);
      formData.append("status", newFeature.status);
      if (newFeature.videoUrl) {
        formData.append("videoUrl", newFeature.videoUrl);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFeatures(f => [...f, res.data]);
      setNewFeature({ title: "", description: "", priority: "Low", status: "Open", videoUrl: "" });
      setImageFile(null);
      setAdding(false);
      setLastAddedId(res.data.id || res.data._id);
      setShowPriorityDialog(true);
    } catch (err) {
      setError("Failed to add feature");
      setErrorDetails(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };
  // Edit feature: open beautiful modal
  const handleEdit = (feature) => {
    setEditing(feature);
  };

  // Close edit modal
  const handleEditClose = () => {
    setEditing(null);
    setImageFile(null);
    setVideoFile(null);
  };

  // Delete feature
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setFeatures(f => f.filter(feat => feat.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete feature');
      setErrorDetails(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", background: "#fff", borderRadius: 12, padding: 32, color: '#222', boxShadow: '0 2px 16px #0001' }}>
        <h2 style={{ fontSize: 28, marginBottom: 24, fontWeight: 800 }}>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          {loginError && <div style={{ color: 'red', fontSize: 15 }}>{loginError}</div>}
          <button type="submit" style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 12, padding: 32, color: '#222', boxShadow: '0 2px 16px #0001' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 32, marginBottom: 16, fontWeight: 800, letterSpacing: 1 }}>Admin Feature Management</h2>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Logout</button>
      </div>
      <div style={{ marginBottom: 32, color: '#666', fontSize: 18 }}>
        <span>Manage, prioritize, and update all features in one place.</span>
      </div>
      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          <p>{error}</p>
          {errorDetails && (
            <details style={{ fontSize: 13, marginTop: 4 }}>
              <summary>Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{errorDetails}</pre>
            </details>
          )}
          <button onClick={fetchFeatures} style={{ marginTop: 8 }}>Retry</button>
        </div>
      )}
      <h3 style={{ fontSize: 22, margin: '32px 0 12px 0', fontWeight: 700, color: '#333' }}>Add New Feature</h3>
      <button onClick={() => setAdding(true)} style={{ marginBottom: 24, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>+ Add Feature</button>
      {adding && (
        <AdminFeatureModal
          feature={null}
          onSave={async (form) => {
            setError(null);
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append("title", form.title);
              formData.append("description", form.description);
              formData.append("priority", form.priority);
              formData.append("status", form.status);
              if (form.videoUrl) {
                formData.append("videoUrl", form.videoUrl);
              }
              if (form.video) {
                formData.append("video", form.video);
              }
              if (form.image) {
                formData.append("image", form.image);
              }
              const res = await axios.post(API_URL, formData, {
                headers: { "Content-Type": "multipart/form-data" }
              });
              setFeatures(f => [...f, res.data]);
              setImageFile(null);
            } catch (err) {
              setError("Failed to add feature");
              setErrorDetails(err?.message || JSON.stringify(err));
            } finally {
              setLoading(false);
              setAdding(false);
            }
          }}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <AdminFeatureModal
          feature={editing}
          onSave={async (form) => {
            setError(null);
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append("title", form.title);
              formData.append("description", form.description);
              formData.append("priority", form.priority);
              formData.append("status", form.status);
              if (form.videoUrl) {
                formData.append("videoUrl", form.videoUrl);
              }
              if (form.video) {
                formData.append("video", form.video);
              }
              if (form.image) {
                formData.append("image", form.image);
              }
              await axios.put(`${API_URL}/${editing.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
              });
              fetchFeatures();
            } catch (err) {
              setError("Failed to update feature");
              setErrorDetails(err?.message || JSON.stringify(err));
            } finally {
              setLoading(false);
              handleEditClose();
            }
          }}
          onClose={handleEditClose}
        />
      )}
      <h3 style={{ fontSize: 22, margin: '32px 0 12px 0', fontWeight: 700, color: '#333' }}>All Features</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent", fontSize: 16 }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>ID</th>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>Title</th>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>Priority</th>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>Status</th>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>Created</th>
            <th style={{ textAlign: "left", padding: "10px 8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {features.map(f => (
            <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px 8px" }}>{f.id}</td>
              <td style={{ padding: "10px 8px" }}>{f.title}</td>
              <td style={{ padding: "10px 8px" }}>{f.priority}</td>
              <td style={{ padding: "10px 8px" }}>{f.status}</td>
              <td style={{ padding: "10px 8px" }}>{new Date(f.createdAt).toLocaleString()}</td>
              <td style={{ padding: "10px 8px" }}>
                <button onClick={() => handleEdit(f)} style={{ marginRight: 6, background: '#e0e7ff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 4 }}>✏️</span>Edit
                </button>
                <button onClick={() => setDeleteConfirm(f.id)} style={{ color: '#fff', background: '#e74c3c', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 4 }}>🗑️</span>Delete
                </button>
                {/* Delete confirmation dialog */}
                {deleteConfirm === f.id && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 16px #0002', textAlign: 'center' }}>
                      <h4 style={{ marginBottom: 16 }}>Are you sure you want to delete this feature?</h4>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <button onClick={() => { handleDelete(f.id); setDeleteConfirm(null); }} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>Yes, Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </td>
              <td style={{ padding: "10px 8px" }}>
                {f.image && (
                  <img src={`http://localhost:5000/api/features/images/${f.image}`} alt="feature" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 6 }} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

