// AdminFeatureModal.jsx  — Enhanced Material Design style
// Drop this alongside FeatureModal.jsx — it does NOT modify that file.
// Usage: <AdminFeatureModal feature={feature} onSave={handleSave} onClose={handleClose} />

import React, { useState, useEffect, useRef } from "react";
import { PRIORITIES, STATUSES } from "../utils/costants";

const EMPTY = { title: "", description: "", priority: "Medium", status: "Open" };

/* ── Google Fonts injection (Nunito + DM Sans) ─────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
if (!document.head.querySelector("[href*='Nunito']")) document.head.appendChild(fontLink);

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const T = {
  primary:     "#5C6BC0",
  primaryDk:   "#3949AB",
  primaryLt:   "#E8EAF6",
  accent:      "#26C6DA",
  surface:     "#FFFFFF",
  bg:          "#F5F6FA",
  border:      "#E3E6EF",
  textPrimary: "#1A1D2E",
  textSecondary: "#6B7280",
  textHint:    "#9CA3AF",
  danger:      "#EF5350",
  shadow:      "0 8px 32px rgba(92,107,192,0.13)",
  shadowSm:    "0 2px 8px rgba(92,107,192,0.10)",
  radius:      "12px",
  radiusSm:    "8px",
  font:        "'Nunito', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

/* ── Keyframe + global style injection ─────────────────────────────────────── */
if (!document.head.querySelector("[data-amf]")) {
  const s = document.createElement("style");
  s.setAttribute("data-amf", "1");
  s.textContent = `
    @keyframes amf-fadeIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
    @keyframes amf-ripple  { from{transform:scale(0);opacity:.35} to{transform:scale(4);opacity:0} }
    @keyframes amf-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
    .amf-modal  { animation: amf-fadeIn .28s cubic-bezier(.4,0,.2,1) both }
    .amf-shake  { animation: amf-shake .35s ease }
    .amf-input:focus  { border-color:${T.primary}!important; box-shadow:0 0 0 3px ${T.primaryLt}!important; outline:none; }
    .amf-select:focus { border-color:${T.primary}!important; box-shadow:0 0 0 3px ${T.primaryLt}!important; outline:none; }
    .amf-input::placeholder,.amf-url-input::placeholder { color:${T.textHint}; }
    .amf-url-input:focus { border-color:${T.primary}!important; box-shadow:0 0 0 3px ${T.primaryLt}!important; outline:none; }
    .amf-close:hover  { background:#F3F4F6!important; }
    .amf-ghost:hover  { background:#F3F4F6!important; border-color:#C0C4D4!important; }
    .amf-primary:hover { background:${T.primaryDk}!important; box-shadow:0 4px 16px rgba(57,73,171,.38)!important; }
    .amf-tab:hover:not(.amf-tab-active) { background:#EEEFF8!important; color:${T.primary}!important; }
    .amf-upload:hover { background:#ECEEFE!important; box-shadow:0 0 0 3px ${T.primaryLt}; }
    .amf-replace:hover { background:#dde0f5!important; }
    .amf-remove:hover  { background:rgba(255,235,235,.55)!important; }
    .amf-chip:hover    { background:#dde0f5!important; }
    .amf-ripple { position:relative; overflow:hidden; }
    .amf-ripple::after {
      content:''; position:absolute; border-radius:50%;
      width:120px; height:120px; margin:-60px 0 0 -60px;
      background:rgba(255,255,255,.38);
      top:var(--ry,50%); left:var(--rx,50%);
      transform:scale(0); opacity:0;
    }
    .amf-ripple:active::after { animation:amf-ripple .5s ease-out; }
  `;
  document.head.appendChild(s);
}

/* ── SVG icons (Material-community style) ──────────────────────────────────── */
const Ic = {
  Image: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Upload: () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Link: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Shield: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  ),
  Close: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  File: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  ),
};

/* ── Reusable field label ────────────────────────────────────────────────────── */
function FieldLabel({ children, htmlFor, error }) {
  return (
    <label htmlFor={htmlFor} style={{
      display: "block", fontSize: 10.5, fontWeight: 800,
      color: error ? T.danger : T.primary,
      letterSpacing: "0.07em", textTransform: "uppercase",
      marginBottom: 6, fontFamily: T.font,
    }}>
      {children}
    </label>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 4,
      color: T.danger, fontSize: 11.5, marginTop: 5,
      fontFamily: T.fontBody,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill={T.danger}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {msg}
    </span>
  );
}

const baseInput = {
  width: "100%", padding: "10px 14px", borderRadius: T.radiusSm,
  border: `1.5px solid ${T.border}`, fontSize: 14,
  fontFamily: T.fontBody, boxSizing: "border-box",
  background: T.surface, color: T.textPrimary,
  transition: "border-color .18s, box-shadow .18s",
};

/* ════════════════════════════════════════════════════════════════════════════ */
export default function AdminFeatureModal({ feature, onSave, onClose }) {
  const [form, setForm]                 = useState(feature ? { ...feature } : { ...EMPTY });
  const [errors, setErrors]             = useState({});
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(feature?.imageUrl || null);
  const [dragging, setDragging]         = useState(false);
  const [tab, setTab]                   = useState("upload");
  const [urlInput, setUrlInput]         = useState("");
  const [urlError, setUrlError]         = useState("");
  const [videoUrl, setVideoUrl]         = useState(feature?.videoUrl || "");
  const [videoUrlError, setVideoUrlError] = useState("");
  const [videoFile, setVideoFile]       = useState(null);
  const [videoDragging, setVideoDragging] = useState(false);

  const titleRef       = useRef(null);
  const fileInputRef   = useRef(null);
  const changeInputRef = useRef(null);
  const videoInputRef  = useRef(null);
  const isEdit         = Boolean(feature);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Handle paste events for images and videos
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (!file) continue;

          if (file.type.startsWith("image/")) {
            applyFile(file);
            e.preventDefault();
            return; // Only handle one file per paste
          } else if (file.type.startsWith("video/")) {
            applyVideoFile(file);
            e.preventDefault();
            return; // Only handle one file per paste
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    else if (form.title.trim().length < 3) errs.title = "Must be at least 3 characters.";
    if (!form.description.trim()) errs.description = "Description is required.";
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, image: imageFile, imageUrl: imageFile ? undefined : (imagePreview || undefined), videoUrl, video: videoFile });
    onClose();
  }

  function applyFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUrlInput(""); setUrlError("");
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  }

  function removeImage() {
    setImageFile(null); setImagePreview(null);
    setUrlInput(""); setUrlError("");
    if (fileInputRef.current)   fileInputRef.current.value = "";
    if (changeInputRef.current) changeInputRef.current.value = "";
  }

  function applyUrlImage() {
    const url = urlInput.trim();
    if (!url) { setUrlError("Please enter a URL."); return; }
    try { new URL(url); } catch { setUrlError("Invalid URL format."); return; }
    setUrlError(""); setImageFile(null); setImagePreview(url);
  }

  // Video file handlers
  function applyVideoFile(file) {
    if (!file || !file.type.startsWith("video/")) return;
    setVideoFile(file);
  }

  function handleVideoDrop(e) {
    e.preventDefault(); setVideoDragging(false);
    applyVideoFile(e.dataTransfer.files[0]);
  }

  function removeVideo() {
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,18,40,0.58)",
        backdropFilter: "blur(7px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: T.font,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Left accent border wrapper — radius on ALL four corners ── */}
      <div style={{
        width: "100%", maxWidth: 580,
        borderLeft: `4px solid ${T.primary}`,
        borderRadius: 18,
        boxShadow: "0 32px 72px rgba(15,18,40,0.28), 0 0 0 1px rgba(255,255,255,.05)",
      }}>
      <div
        className="amf-modal"
        role="dialog" aria-modal="true"
        aria-label={isEdit ? "Admin: Edit Feature" : "Admin: New Feature"}
        style={{
          background: T.surface, borderRadius: 18,
          width: "100%",
          maxHeight: "92vh", overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* ── Gradient top bar ── */}
        <div style={{
          height: 4, borderRadius: "18px 18px 0 0", flexShrink: 0,
          background: `linear-gradient(90deg, ${T.primary} 0%, ${T.accent} 100%)`,
        }} />

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{
              margin: 0, fontSize: 20, fontWeight: 800,
              color: T.textPrimary, letterSpacing: "-0.3px",
            }}>
              {isEdit ? "Edit Request" : "New Request"}
            </h2>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: T.primaryLt, color: T.primary,
              borderRadius: 20, padding: "3px 10px",
              fontSize: 10, fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <Ic.Shield /> Admin
            </span>
          </div>
          <button
            className="amf-close"
            onClick={onClose} aria-label="Close"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.textSecondary, borderRadius: 8, padding: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
            }}
          >
            <Ic.Close />
          </button>
        </div>

        <div style={{ height: 1, background: T.border, margin: "0 24px" }} />

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} noValidate style={{ flex: 1 }}>
          <div style={{ padding: "22px 24px 8px" }}>

            {/* Title */}
            <div style={{ marginBottom: 18 }} className={errors.title ? "amf-shake" : ""}>
              <FieldLabel htmlFor="adm-title" error={errors.title}>Title</FieldLabel>
              <input
                ref={titleRef}
                id="adm-title" name="title" type="text"
                value={form.title} onChange={handleChange}
                placeholder="Short, descriptive title…"
                className="amf-input"
                style={{ ...baseInput, ...(errors.title ? { borderColor: T.danger } : {}) }}
                autoComplete="off"
              />
              <ErrorMsg msg={errors.title} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }} className={errors.description ? "amf-shake" : ""}>
              <FieldLabel htmlFor="adm-desc" error={errors.description}>Description</FieldLabel>
              <textarea
                id="adm-desc" name="description"
                value={form.description} onChange={handleChange}
                placeholder="What should this feature do?"
                rows={3}
                className="amf-input"
                style={{
                  ...baseInput, resize: "vertical",
                  ...(errors.description ? { borderColor: T.danger } : {}),
                }}
              />
              <ErrorMsg msg={errors.description} />
            </div>

            {/* Status */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel htmlFor="adm-status">Status</FieldLabel>
              <select
                id="adm-status" name="status"
                value={form.status} onChange={handleChange}
                className="amf-select"
                style={{
                  ...baseInput, cursor: "pointer", appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: 36,
                }}
              >
                {STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* ── Image Management panel ── */}
            <div style={{ marginBottom: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <span style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 10.5, fontWeight: 800, color: T.primary,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                  fontFamily: T.font,
                }}>
                  <Ic.Image /> Image Management
                  <span style={{
                    fontWeight: 500, color: T.textHint,
                    textTransform: "none", fontSize: 11, letterSpacing: 0,
                  }}>
                    — optional
                  </span>
                </span>
                {imagePreview && (
                  <button
                    type="button"
                    className="amf-remove"
                    onClick={removeImage}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: "#FFF0F0", color: T.danger,
                      border: "none", borderRadius: 7,
                      padding: "5px 12px", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: T.font,
                      transition: "background .15s",
                    }}
                  >
                    <Ic.Trash /> Remove
                  </button>
                )}
              </div>

              {imagePreview ? (
                /* ── Preview card ── */
                <div style={{
                  borderRadius: 14, overflow: "hidden",
                  boxShadow: T.shadow, background: T.bg,
                }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={imagePreview} alt="preview"
                      style={{ display: "block", width: "100%", maxHeight: 200, objectFit: "cover" }}
                    />
                    {/* gradient */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,.52) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }} />
                    {/* file info */}
                    <div style={{
                      position: "absolute", bottom: 10, left: 12,
                      color: "#fff", fontSize: 12, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 5,
                      fontFamily: T.fontBody,
                    }}>
                      {imageFile
                        ? <><Ic.File /> {imageFile.name} · {(imageFile.size / 1024).toFixed(1)} KB</>
                        : <><Ic.Link /> URL source</>
                      }
                    </div>
                  </div>
                  {/* replace row */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px",
                    background: T.bg, borderTop: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: T.fontBody }}>
                      Image attached successfully
                    </span>
                    <label
                      className="amf-replace amf-ripple"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: T.primaryLt, color: T.primary,
                        borderRadius: 7, padding: "6px 14px",
                        fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: T.font,
                        transition: "background .15s",
                      }}
                    >
                      <Ic.Refresh /> Replace
                      <input
                        ref={changeInputRef}
                        type="file" accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => applyFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                /* ── Empty: tab panel ── */
                <div style={{
                  borderRadius: 14, background: T.bg,
                  overflow: "hidden", boxShadow: T.shadowSm,
                }}>
                  {/* Tab strip */}
                  <div style={{
                    display: "flex", background: T.surface,
                    borderBottom: `1px solid ${T.border}`,
                    padding: "6px 6px 0", gap: 2,
                  }}>
                    {[
                      { key: "upload", icon: <Ic.Upload />, label: "Upload File" },
                      { key: "url",    icon: <Ic.Link />,   label: "Image URL"  },
                    ].map(({ key, icon, label }) => {
                      const active = tab === key;
                      return (
                        <button
                          key={key} type="button"
                          className={`amf-tab${active ? " amf-tab-active" : ""}`}
                          onClick={() => setTab(key)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 18px", border: "none", cursor: "pointer",
                            fontSize: 13, fontWeight: active ? 700 : 500,
                            fontFamily: T.font,
                            background: active ? T.primaryLt : "transparent",
                            color: active ? T.primary : T.textSecondary,
                            borderRadius: "8px 8px 0 0",
                            borderBottom: active ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
                            transition: "all .18s",
                          }}
                        >
                          {icon} {label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding: 16 }}>
                    {tab === "upload" ? (
                      /* ── Upload zone — solid fill, no border ── */
                      <div
                        className="amf-upload"
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          borderRadius: 12,
                          padding: "38px 20px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: dragging ? "#ECEEFE" : "#EEEEF8",
                          boxShadow: dragging ? `0 0 0 3px ${T.primaryLt}` : "none",
                          userSelect: "none",
                          transition: "background .2s, box-shadow .2s",
                        }}
                      >
                        {/* icon bubble */}
                        <div style={{
                          width: 60, height: 60, borderRadius: 16,
                          background: dragging ? T.primary : T.surface,
                          boxShadow: T.shadow,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 14px",
                          color: dragging ? "#fff" : T.primary,
                          transition: "background .2s, color .2s",
                        }}>
                          <Ic.Upload />
                        </div>
                        <div style={{
                          fontSize: 15, fontWeight: 800,
                          color: T.textPrimary, marginBottom: 5,
                          fontFamily: T.font,
                        }}>
                          {dragging ? "Drop it here!" : "Drag & drop your image"}
                        </div>
                        <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: T.fontBody }}>
                          or{" "}
                          <span style={{ color: T.primary, fontWeight: 700, textDecoration: "underline" }}>
                            browse files
                          </span>
                          {" "}· or{" "}
                          <span style={{ color: T.accent, fontWeight: 700, textDecoration: "underline" }}>
                            paste from clipboard
                          </span>
                        </div>
                        {/* format chips */}
                        <div style={{
                          display: "flex", justifyContent: "center",
                          gap: 6, marginTop: 14, flexWrap: "wrap",
                        }}>
                          {["PNG", "JPG", "GIF", "WEBP"].map((f) => (
                            <span key={f} className="amf-chip" style={{
                              background: T.surface, color: T.textSecondary,
                              borderRadius: 20, padding: "2px 10px",
                              fontSize: 10.5, fontWeight: 700,
                              letterSpacing: "0.04em",
                              boxShadow: T.shadowSm,
                              transition: "background .15s",
                            }}>
                              {f}
                            </span>
                          ))}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file" accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => applyFile(e.target.files[0])}
                        />
                      </div>
                    ) : (
                      /* ── URL tab ── */
                      <div>
                        <p style={{
                          fontSize: 12.5, color: T.textSecondary,
                          margin: "0 0 12px", fontFamily: T.fontBody,
                        }}>
                          Paste a direct link to any publicly accessible image.
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                            placeholder="https://example.com/photo.png"
                            className="amf-url-input"
                            style={{ ...baseInput, flex: 1, fontSize: 13 }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrlImage())}
                          />
                          <button
                            type="button"
                            className="amf-primary amf-ripple"
                            onClick={applyUrlImage}
                            style={{
                              padding: "0 18px", borderRadius: T.radiusSm,
                              border: "none", background: T.primary,
                              color: "#fff", fontSize: 13, fontWeight: 700,
                              cursor: "pointer", whiteSpace: "nowrap",
                              fontFamily: T.font,
                              display: "flex", alignItems: "center", gap: 5,
                              boxShadow: "0 2px 8px rgba(92,107,192,.3)",
                              transition: "background .15s, box-shadow .15s",
                            }}
                          >
                            <Ic.Check /> Apply
                          </button>
                        </div>
                        {urlError && (
                          <span style={{
                            color: T.danger, fontSize: 11.5,
                            marginTop: 6, display: "block",
                            fontFamily: T.fontBody,
                          }}>
                            {urlError}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Video URL field ── */}
          <div style={{ padding: "0 24px", marginBottom: 18 }}>
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 10.5, fontWeight: 800, color: T.primary,
              letterSpacing: "0.07em", textTransform: "uppercase",
              fontFamily: T.font,
              marginBottom: 12,
            }}>
              <Ic.Link /> Video Link
              <span style={{
                fontWeight: 500, color: T.textHint,
                textTransform: "none", fontSize: 11, letterSpacing: 0,
              }}>
                — optional
              </span>
            </span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => { setVideoUrl(e.target.value); setVideoUrlError(""); }}
              placeholder="https://youtube.com/watch?v=... or any video link"
              className="amf-url-input"
              style={{ ...baseInput, fontSize: 13, marginBottom: 6 }}
            />
            {videoUrlError && (
              <span style={{
                color: T.danger, fontSize: 11.5,
                display: "block", fontFamily: T.fontBody,
              }}>
                {videoUrlError}
              </span>
            )}
          </div>

          {/* ── Video File Upload ── */}
          <div style={{ padding: "0 24px", marginBottom: 18 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 10.5, fontWeight: 800, color: T.primary,
                letterSpacing: "0.07em", textTransform: "uppercase",
                fontFamily: T.font,
              }}>
                <span style={{ fontSize: 16 }}>🎬</span> Upload Video Clip
                <span style={{
                  fontWeight: 500, color: T.textHint,
                  textTransform: "none", fontSize: 11, letterSpacing: 0,
                }}>
                  — optional
                </span>
              </span>
              {videoFile && (
                <button
                  type="button"
                  className="amf-remove"
                  onClick={removeVideo}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "#FFF0F0", color: T.danger,
                    border: "none", borderRadius: 7,
                    padding: "5px 12px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: T.font,
                    transition: "background .15s",
                  }}
                >
                  <Ic.Trash /> Remove
                </button>
              )}
            </div>

            {videoFile ? (
              /* ── Video Preview Card ── */
              <div style={{
                borderRadius: 14, overflow: "hidden",
                boxShadow: T.shadow, background: T.bg,
              }}>
                <div style={{
                  padding: "14px",
                  background: T.bg, borderBottom: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24 }}>🎥</span>
                    <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: T.fontBody }}>
                      <div style={{ fontWeight: 600, color: T.textPrimary }}>{videoFile.name}</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <label
                    className="amf-replace amf-ripple"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: T.primaryLt, color: T.primary,
                      borderRadius: 7, padding: "6px 14px",
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: T.font,
                      transition: "background .15s",
                    }}
                  >
                    <Ic.Refresh /> Change
                    <input
                      ref={videoInputRef}
                      type="file" accept="video/*"
                      style={{ display: "none" }}
                      onChange={(e) => applyVideoFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* ── Video Upload Zone ── */
              <div
                className="amf-upload"
                onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                onDragLeave={() => setVideoDragging(false)}
                onDrop={handleVideoDrop}
                onClick={() => videoInputRef.current?.click()}
                style={{
                  borderRadius: 12,
                  padding: "32px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: videoDragging ? "#ECEEFE" : "#EEEEF8",
                  boxShadow: videoDragging ? `0 0 0 3px ${T.primaryLt}` : "none",
                  userSelect: "none",
                  transition: "background .2s, box-shadow .2s",
                  border: `2px dashed ${videoDragging ? T.primary : T.border}`,
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: videoDragging ? T.primary : T.surface,
                  boxShadow: T.shadow,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                  color: videoDragging ? "#fff" : T.primary,
                  transition: "background .2s, color .2s",
                  fontSize: 28,
                }}>
                  🎬
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: T.textPrimary, marginBottom: 4,
                  fontFamily: T.font,
                }}>
                  {videoDragging ? "Drop video here!" : "Drag & drop your video"}
                </div>
                <div style={{ fontSize: 12.5, color: T.textSecondary, fontFamily: T.fontBody, marginBottom: 12 }}>
                  or{" "}
                  <span style={{ color: T.primary, fontWeight: 700, textDecoration: "underline" }}>
                    browse files
                  </span>
                  {" "}· or{" "}
                  <span style={{ color: T.accent, fontWeight: 700, textDecoration: "underline" }}>
                    paste from clipboard
                  </span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "center",
                  gap: 6, flexWrap: "wrap",
                }}>
                  {["MP4", "WebM", "MOV"].map((f) => (
                    <span key={f} className="amf-chip" style={{
                      background: T.surface, color: T.textSecondary,
                      borderRadius: 20, padding: "2px 10px",
                      fontSize: 10.5, fontWeight: 700,
                      letterSpacing: "0.04em",
                      boxShadow: T.shadowSm,
                      transition: "background .15s",
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
                <input
                  ref={videoInputRef}
                  type="file" accept="video/*"
                  style={{ display: "none" }}
                  onChange={(e) => applyVideoFile(e.target.files[0])}
                />
              </div>
            )}
          </div>


          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 10,
            padding: "14px 24px 22px", marginTop: 8,
          }}>
            <button
              type="button"
              className="amf-ghost"
              onClick={onClose}
              style={{
                padding: "9px 22px", borderRadius: T.radiusSm,
                border: `1.5px solid ${T.border}`, background: T.surface,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                color: T.textSecondary, fontFamily: T.font,
                transition: "background .15s, border-color .15s",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="amf-primary amf-ripple"
              style={{
                padding: "9px 28px", borderRadius: T.radiusSm,
                border: "none", background: T.primary,
                color: "#fff", fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: T.font,
                letterSpacing: "0.02em",
                boxShadow: "0 4px 14px rgba(92,107,192,.35)",
                transition: "background .15s, box-shadow .15s",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {isEdit ? "Save Changes" : "Add Request"}
            </button>
          </div>
        </form>

      </div>
      </div>
    </div>
  );
}
