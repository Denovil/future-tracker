import React, { useEffect, useState } from "react";
import AdminFeatureModal from "./AdminFeatureModal";
import axios from "axios";
import { API_ORIGIN, API_URL } from "../utils/api";
import { normalizeStatus } from "../utils/constants";

const AUTH_API_URL = `${API_ORIGIN}/api/auth/login`;
const HEALTH_API_URL = `${API_ORIGIN}/health`;
const MOCK_TITLES = new Set([
  "Dark mode support",
  "Export to CSV",
  "Email notifications",
  "Mobile app support",
  "Advanced search filters",
]);
const LISTING_UPLOAD_TIMEOUT_MS = 120000;
const QUICK_TIMEOUT_MS = 7000;

const resolveRequestError = (err) => {
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please check backend server and internet speed.";
  }
  if (!err?.response) {
    return `Cannot connect to backend server at ${API_ORIGIN || "this host"}. Start backend with: cd backend && node app.js`;
  }
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Request failed"
  );
};

const ensureBackendOnline = async () => {
  await axios.get(HEALTH_API_URL, { timeout: 4000 });
};

export default function AdminDashboard({ onFeaturesChanged }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [newFeature, setNewFeature] = useState({ title: "", description: "", priority: "Low", status: "Available", videoUrl: "" });
  const [lastAddedId, setLastAddedId] = useState(null);
  // Admin login state
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loginNotice, setLoginNotice] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch features
  const fetchFeatures = () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    axios.get(API_URL, { timeout: QUICK_TIMEOUT_MS })
      .then(res => setFeatures(res.data.filter((feature) => !MOCK_TITLES.has(feature.title))))
      .catch(err => {
        setError("Failed to fetch spare listings");
        setErrorDetails(resolveRequestError(err));
        console.error("Fetch features error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeatures(); }, []);
  // Simple admin login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginLoading) return;
    setLoginError(null);
    setLoginNotice(null);
    setLoginLoading(true);
    try {
      const res = await axios.post(AUTH_API_URL, {
        username: "admin",
      }, {
        timeout: 8000,
      });
      if (res.data && res.data.success) {
        setUser(res.data.user || { username: "admin" });
      } else {
        setLoginError("Unable to open admin");
      }
    } catch (err) {
      const timedOut = err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "");
      const noResponse = !err?.response;
      if (timedOut || noResponse) {
        setUser({ username: "admin" });
        setLoginNotice("Backend is offline. You can open admin view, but Add/Edit/Delete will fail until backend starts on port 5000.");
        return;
      }

      const serverMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message;

      setLoginError(`Login failed: ${serverMessage || "Backend not responding"} (${AUTH_API_URL})`);
    } finally {
      setLoginLoading(false);
    }
  };
  const handleLogout = () => {
    setUser(null);
  };

  // Add, edit, delete handlers (implement as needed)
  const handleAdd = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      setError("Part name and description are required.");
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
      if (onFeaturesChanged) {
        await onFeaturesChanged();
      }
      setNewFeature({ title: "", description: "", priority: "Low", status: "Available", videoUrl: "" });
      setImageFile(null);
      setAdding(false);
      setLastAddedId(res.data.id || res.data._id);
    } catch (err) {
      setError("Failed to add spare listing");
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
      if (onFeaturesChanged) {
        await onFeaturesChanged();
      }
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete spare listing');
      setErrorDetails(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(16px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-top))',
        background: 'linear-gradient(135deg, #f5f8fb 0%, #e8f4f8 100%)',
      }}>
        <div style={{
          maxWidth: 420,
          width: '100%',
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          color: '#222',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(79, 70, 229, 0.1)'
        }}>
          <h2 style={{ fontSize: 28, marginBottom: 16, fontWeight: 800, color: '#1a1d2e' }}>Admin Access</h2>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 14 }}>
            Credentials have been removed. Use the button below to open the admin dashboard.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loginError && <div style={{ color: '#e8544a', fontSize: 13, fontWeight: 600 }}>⚠️ {loginError}</div>}
            {loginNotice && <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 600 }}>{loginNotice}</div>}
            <button type="submit" disabled={loginLoading} style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: 8,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              opacity: loginLoading ? 0.7 : 1
            }} onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)'} onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)'}>{loginLoading ? "Opening..." : "Enter Admin"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e9f7 100%)',
      backgroundAttachment: 'fixed',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      paddingLeft: 'max(20px, env(safe-area-inset-left))',
      paddingRight: 'max(20px, env(safe-area-inset-right))',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 'max(32px, clamp(20px, 5vw, 48px))',
        color: '#1a1d2e',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(79, 70, 229, 0.08)',
        backdropFilter: 'blur(8px)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              marginBottom: 8,
              fontWeight: 800,
              letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>Admin Spare Listings</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 0 }}>Post and manage car spare parts for your marketplace storefront.</p>
          </div>
          <button onClick={handleLogout} style={{
            background: 'linear-gradient(135deg, #e8544a 0%, #dc3545 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(232, 84, 74, 0.3)',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>Logout</button>
        </div>

        {/* Error Section */}
        {loading && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(79, 70, 229, 0.08)',
            borderRadius: 8,
            marginBottom: 24,
            color: '#4f46e5',
            fontWeight: 600
          }}>⏳ Loading spare listings...</div>
        )}
        {error && (
          <div style={{
            padding: '14px 16px',
            background: 'rgba(232, 84, 74, 0.08)',
            borderRadius: 8,
            marginBottom: 24,
            color: '#e8544a',
            fontWeight: 600,
            border: '1px solid rgba(232, 84, 74, 0.2)'
          }}>
            <p style={{ margin: 0, marginBottom: 8 }}>⚠️ {error}</p>
            {errorDetails && (
              <details style={{ fontSize: 12, marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, marginTop: 8, background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>{errorDetails}</pre>
              </details>
            )}
            <button onClick={fetchFeatures} style={{
              marginTop: 12,
              background: '#e8544a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600
            }}>Retry</button>
          </div>
        )}

        {/* Add Listing Section */}
        <div style={{
          marginBottom: 32,
          paddingBottom: 32,
          borderBottom: '1px solid rgba(79, 70, 229, 0.1)'
        }}>
          <h3 style={{ fontSize: 18, margin: '0 0 12px 0', fontWeight: 700, color: '#1a1d2e' }}>Add New Spare Listing</h3>
          <button onClick={() => setAdding(true)} style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>+ Add Spare Listing</button>
        </div>
      {adding && (
        <AdminFeatureModal
          feature={null}
          onSave={async (form) => {
            setError(null);
            setLoading(true);
            try {
              await ensureBackendOnline();
              const clipFiles = Array.isArray(form.imageClipFiles) ? form.imageClipFiles : [];
              const formData = new FormData();
              formData.append("title", form.title);
              formData.append("description", form.description);
              formData.append("priority", form.priority);
              formData.append("status", form.status);
              formData.append("price", form.price || "");
              formData.append("sellerName", form.sellerName || "");
              formData.append("location", form.location || "");
              formData.append("condition", form.condition || "");
              formData.append("brand", form.brand || "");
              if (form.videoUrl) {
                formData.append("videoUrl", form.videoUrl);
              }
              if (form.video) {
                formData.append("video", form.video);
              }
              if (clipFiles.length > 0) {
                clipFiles.forEach((file) => {
                  formData.append("imageClip", file);
                });
              } else if (form.imageClip) {
                formData.append("imageClip", form.imageClip);
              }
              if (form.imageClipTitle) {
                formData.append("imageClipTitle", form.imageClipTitle);
              }
              if (form.imageClipDescription) {
                formData.append("imageClipDescription", form.imageClipDescription);
              }
              if (form.image) {
                formData.append("image", form.image);
              } else if (!form.imageUrl && clipFiles.length > 0) {
                formData.append("image", clipFiles[0]);
              }
              if (form.imageUrl) {
                formData.append("imageUrl", form.imageUrl);
              }
              if (form.imageTitle) {
                formData.append("imageTitle", form.imageTitle);
              }
              if (form.imageDescription) {
                formData.append("imageDescription", form.imageDescription);
              }
              // Always send videos, imageClips and links arrays (even if empty)
              formData.append("videos", JSON.stringify(form.videos || []));
              formData.append("links", JSON.stringify(form.links || []));
              formData.append("videoFiles", JSON.stringify(form.videoFiles || []));
              formData.append("imageClips", JSON.stringify(form.imageClips || []));
              
              const res = await axios.post(API_URL, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: LISTING_UPLOAD_TIMEOUT_MS,
              });
              setFeatures(f => [...f, res.data]);
              setImageFile(null);
              setAdding(false);
              if (onFeaturesChanged) {
                Promise.resolve(onFeaturesChanged()).catch((refreshErr) => {
                  console.error("Post-save refresh failed:", refreshErr);
                });
              }
            } catch (err) {
              setError("Failed to add spare listing");
              setErrorDetails(resolveRequestError(err));
              throw err;
            } finally {
              setLoading(false);
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
              await ensureBackendOnline();
              const clipFiles = Array.isArray(form.imageClipFiles) ? form.imageClipFiles : [];
              const formData = new FormData();
              formData.append("title", form.title);
              formData.append("description", form.description);
              formData.append("priority", form.priority);
              formData.append("status", form.status);
              formData.append("price", form.price || "");
              formData.append("sellerName", form.sellerName || "");
              formData.append("location", form.location || "");
              formData.append("condition", form.condition || "");
              formData.append("brand", form.brand || "");
              if (form.videoUrl) {
                formData.append("videoUrl", form.videoUrl);
              }
              if (form.video) {
                formData.append("video", form.video);
              }
              if (clipFiles.length > 0) {
                clipFiles.forEach((file) => {
                  formData.append("imageClip", file);
                });
              } else if (form.imageClip) {
                formData.append("imageClip", form.imageClip);
              }
              if (form.imageClipTitle) {
                formData.append("imageClipTitle", form.imageClipTitle);
              }
              if (form.imageClipDescription) {
                formData.append("imageClipDescription", form.imageClipDescription);
              }
              if (form.image) {
                formData.append("image", form.image);
              } else if (!form.imageUrl && clipFiles.length > 0) {
                formData.append("image", clipFiles[0]);
              }
              if (form.imageUrl) {
                formData.append("imageUrl", form.imageUrl);
              }
              if (form.imageTitle) {
                formData.append("imageTitle", form.imageTitle);
              }
              if (form.imageDescription) {
                formData.append("imageDescription", form.imageDescription);
              }
              // Always send videos, imageClips and links arrays (even if empty)
              formData.append("videos", JSON.stringify(form.videos || []));
              formData.append("links", JSON.stringify(form.links || []));
              formData.append("videoFiles", JSON.stringify(form.videoFiles || []));
              formData.append("imageClips", JSON.stringify(form.imageClips || []));
              
              await axios.put(`${API_URL}/${editing.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: LISTING_UPLOAD_TIMEOUT_MS,
              });
              setFeatures((current) =>
                current.map((item) => (item.id === editing.id ? { ...item, ...form } : item))
              );
              if (onFeaturesChanged) {
                Promise.resolve(onFeaturesChanged()).catch((refreshErr) => {
                  console.error("Post-update refresh failed:", refreshErr);
                });
              }
              handleEditClose();
            } catch (err) {
              setError("Failed to update spare listing");
              setErrorDetails(resolveRequestError(err));
              throw err;
            } finally {
              setLoading(false);
            }
          }}
          onClose={handleEditClose}
        />
      )}
      
        {/* All Listings Section */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 18, margin: '0 0 16px 0', fontWeight: 700, color: '#1a1d2e' }}>All Spare Listings ({features.length})</h3>
          <div style={{
            overflowX: 'auto',
            borderRadius: 12,
            border: '1px solid rgba(79, 70, 229, 0.1)',
            background: 'rgba(79, 70, 229, 0.02)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'transparent',
              fontSize: 14
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(79, 70, 229, 0.05) 100%)',
                  borderBottom: '2px solid rgba(79, 70, 229, 0.15)'
                }}>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Part Name</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Seller</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Brand</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Condition</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Posted On</th>
                  <th style={{ textAlign: 'center', padding: '16px 14px', fontWeight: 700, color: '#4f46e5' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{
                      padding: '32px 14px',
                      textAlign: 'center',
                      color: '#9ca3af',
                      fontWeight: 500
                    }}>No listings yet. Add your first spare part to get started.</td>
                  </tr>
                ) : (
                  features.map((f, idx) => (
                    <tr key={f.id} style={{
                      borderBottom: '1px solid rgba(79, 70, 229, 0.08)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(79, 70, 229, 0.02)',
                      transition: 'background 0.2s'
                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(79, 70, 229, 0.02)'}>
                      <td style={{ padding: '14px 14px', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>#{f.id}</td>
                      <td style={{ padding: '14px 14px', fontWeight: 600, color: '#1a1d2e' }}>{f.title}</td>
                      <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 13 }}>{f.sellerName || "-"}</td>
                      <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 13 }}>{f.location || "-"}</td>
                      <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 13 }}>{f.brand || "-"}</td>
                      <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 13 }}>{f.condition || "-"}</td>
                      <td style={{ padding: '14px 14px', color: '#6b7280', fontSize: 13 }}>
                        {Number.isFinite(Number(f.price)) ? `TZS ${Number(f.price).toLocaleString()}` : "-"}
                      </td>
                      <td style={{
                        padding: '14px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: normalizeStatus(f.status) === 'Available' ? 'rgba(91, 156, 246, 0.15)' : normalizeStatus(f.status) === 'In Progress' ? 'rgba(232, 158, 55, 0.15)' : 'rgba(76, 175, 130, 0.15)',
                          color: normalizeStatus(f.status) === 'Available' ? '#5b9cf6' : normalizeStatus(f.status) === 'In Progress' ? '#e89e37' : '#4caf82'
                        }}>{normalizeStatus(f.status)}</span>
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: 12, color: '#6b7280' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(f)} style={{
                          background: 'rgba(79, 70, 229, 0.1)',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          color: '#4f46e5',
                          borderRadius: 6,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          marginRight: 6
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.4)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                        }}>✏️ Edit</button>
                        <button onClick={() => setDeleteConfirm(f.id)} style={{
                          background: 'rgba(232, 84, 74, 0.1)',
                          border: '1px solid rgba(232, 84, 74, 0.2)',
                          color: '#e8544a',
                          borderRadius: 6,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(232, 84, 74, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(232, 84, 74, 0.4)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(232, 84, 74, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(232, 84, 74, 0.2)';
                        }}>🗑️ Delete</button>
                        {deleteConfirm === f.id && (
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            backdropFilter: 'blur(4px)',
                            paddingTop: 'env(safe-area-inset-top)',
                            paddingBottom: 'env(safe-area-inset-bottom)',
                            paddingLeft: 'env(safe-area-inset-left)',
                            paddingRight: 'env(safe-area-inset-right)'
                          }}>
                            <div style={{
                              background: '#fff',
                              padding: 'max(24px, clamp(20px, 5vw, 32px))',
                              borderRadius: 16,
                              minWidth: 320,
                              maxWidth: 420,
                              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                              border: '1px solid rgba(79, 70, 229, 0.1)',
                              textAlign: 'center'
                            }}>
                              <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>Delete Spare Listing?</h4>
                              <p style={{ margin: '0 0 20px 0', fontSize: 14, color: '#6b7280' }}>Are you sure you want to delete <strong>{f.title}</strong>? This action cannot be undone.</p>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                                <button onClick={() => { handleDelete(f.id); setDeleteConfirm(null); }} style={{
                                  background: 'linear-gradient(135deg, #e8544a 0%, #dc3545 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '10px 20px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: 14,
                                  boxShadow: '0 4px 12px rgba(232, 84, 74, 0.25)',
                                  transition: 'all 0.2s'
                                }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>Yes, Delete</button>
                                <button onClick={() => setDeleteConfirm(null)} style={{
                                  background: '#f3f4f6',
                                  color: '#1a1d2e',
                                  border: '1.5px solid #e5e7eb',
                                  borderRadius: 8,
                                  padding: '10px 20px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: 14,
                                  transition: 'all 0.2s'
                                }} onMouseEnter={(e) => e.target.style.background = '#e5e7eb'} onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}>Cancel</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}







