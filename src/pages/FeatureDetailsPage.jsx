import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PRIORITY_META, STATUS_META, formatDate } from "../utils/costants";
import { toApiAssetUrl, toFeatureImageUrl } from "../utils/api";

export default function FeatureDetailsPage({ features }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find feature by matching string IDs
  const feature = features.find((f) => String(f.id) === String(id));

  if (!feature) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Feature not found</h2>
        <p>The requested feature could not be found.</p>
        <button 
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#5B7FFF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Back to Features
        </button>
      </div>
    );
  }

  const pm = PRIORITY_META[feature.priority];
  const sm = STATUS_META[feature.status];
  
  // Adaptive color based on priority
  const getAdaptiveColor = (priority) => {
    const colors = {
      "High": "#FF6B6B",
      "Medium": "#FFA500",
      "Low": "#4CAF50"
    };
    return colors[priority] || "#5B7FFF";
  };
  
  const priorityColor = getAdaptiveColor(feature.priority);

  return (
    <div className="feature-details-page" style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumb Navigation */}
      <div className="feature-details-breadcrumb" style={{ padding: "20px 20px", backgroundColor: "white", borderBottom: "1px solid #eee" }}>
        <div className="feature-details-shell" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <nav className="feature-details-breadcrumb-nav" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button 
              onClick={() => navigate("/")}
              className="feature-details-back-button"
              style={{
                background: "none",
                border: "none",
                color: "#e81aa1",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c01885";
                e.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#e81aa1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ fontSize: "16px" }}>←</span>
              All Features
            </button>
            <span style={{ color: "#ccc", fontSize: "14px" }}>/</span>
            <span className="feature-details-breadcrumb-current" style={{ color: "#333", fontSize: "14px", fontWeight: "500" }}>
              {feature.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="feature-details-layout feature-details-shell" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px" }}>
        
        {/* Left Column - Main Content */}
        <div>
          
          {/* Title Section */}
          <div style={{ marginBottom: "30px" }}>
            <h1 className="feature-details-title" style={{ 
              fontSize: "40px", 
              fontWeight: "700", 
              margin: "0 0 15px 0", 
              color: "#333"
            }}>
              {feature.title}
            </h1>
          </div>

          {/* Description Section */}
          {feature.description && (
            <div style={{ marginBottom: "30px" }}>
              <p className="feature-details-description" style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#555",
                margin: "0",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                {feature.description}
              </p>
            </div>
          )}

          {/* Image Section */}
          {(feature.image || feature.imageUrl) && (
            <div style={{ marginBottom: 0 }}>
              <img
                src={feature.image ? toFeatureImageUrl(feature.image) : feature.imageUrl}
                alt={feature.imageTitle || feature.title}
                className="feature-details-hero-image"
                style={{
                  width: "100%",
                  maxHeight: "450px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                }}
              />
              {(feature.imageTitle || feature.imageDescription) && (
                <div style={{
                  backgroundColor: "white",
                  padding: "16px 18px",
                  borderRadius: "0 0 12px 12px",
                  borderTop: "1px solid #eee"
                }}>
                  {feature.imageTitle && (
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", margin: "0 0 6px 0" }}>
                      {feature.imageTitle}
                    </p>
                  )}
                  {feature.imageDescription && (
                    <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                      {feature.imageDescription}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Location Section */}
          {feature.location && (
            <div style={{ marginBottom: 0 }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
                Location
              </h2>
              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "2px solid #4CAF5020"
              }}>
                <p style={{ fontSize: "14px", margin: "0", color: "#555" }}>
                  📍 {feature.location}
                </p>
              </div>
            </div>
          )}

          {(feature.videos?.length > 0 || feature.videoFiles?.length > 0) && (
            <div className="feature-details-media-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
              marginBottom: "30px",
              alignItems: "start"
            }}>
          {/* Videos Section */}
          {feature.videos && feature.videos.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
                📹 Videos
              </h2>
              <div className="feature-details-resource-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px"
              }}>
                {feature.videos.map((v) => (
                  <div 
                    key={v.id}
                    className="feature-details-resource-card"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      border: "1px solid #eee",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <a 
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="feature-details-video-link"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "150px",
                        backgroundColor: "#000",
                        cursor: "pointer",
                        textDecoration: "none",
                        position: "relative"
                      }}
                    >
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "48px",
                        opacity: 0.8
                      }}>
                        ▶
                      </div>
                    </a>
                    <div style={{ padding: "12px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#333", margin: "0 0 4px 0" }}>
                        📹 {v.title}
                      </p>
                      {v.description && (
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0", lineHeight: "1.4" }}>
                          {v.description}
                        </p>
                      )}
                      <p style={{ fontSize: "11px", color: "#999", margin: "0" }}>
                        {v.viewed ? "Viewed" : "Not viewed"} • {v.views} views • <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: "#e81aa1", textDecoration: "none" }}>Open</a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Files Section */}
          {feature.videoFiles && feature.videoFiles.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
                🎬 Video Clips
              </h2>
              <div className="feature-details-resource-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px"
              }}>
                {feature.videoFiles.map((v) => (
                  <div 
                    key={v.id}
                    className="feature-details-resource-card"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      border: "1px solid #eee",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <video 
                      src={toApiAssetUrl(v.filePath)}
                      controls
                      className="feature-details-video-file"
                      style={{
                        width: "100%",
                        height: "150px",
                        backgroundColor: "#000",
                        display: "block"
                      }}
                    />
                    <div style={{ padding: "12px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#333", margin: "0 0 4px 0" }}>
                        🎥 {v.title}
                      </p>
                      {v.description && (
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0", lineHeight: "1.4" }}>
                          {v.description}
                        </p>
                      )}
                      <p style={{ fontSize: "11px", color: "#999", margin: "0" }}>
                        {v.viewed ? "Viewed" : "Not viewed"} • {v.views} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            </div>
          )}

          {/* Image Clips Section */}
          {feature.imageClips && feature.imageClips.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
                🖼️ Images
              </h2>
              <div className="feature-details-image-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px"
              }}>
                {feature.imageClips.map((img) => (
                  <a 
                    key={img.id}
                    href={toApiAssetUrl(img.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feature-details-resource-card"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      border: "1px solid #eee",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      display: "block"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <img 
                      src={toApiAssetUrl(img.filePath)}
                      alt={img.title}
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                    <div style={{ padding: "10px" }}>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: "#333", margin: "0 0 4px 0" }}>
                        {img.title}
                      </p>
                      {img.description && (
                        <p style={{ fontSize: "11px", color: "#666", margin: "0 0 4px 0", lineHeight: "1.3" }}>
                          {img.description}
                        </p>
                      )}
                      <p style={{ fontSize: "11px", color: "#999", margin: "0" }}>
                        {img.viewed ? "Viewed" : "Not viewed"} • {img.views} views
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          {feature.links && feature.links.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
                🔗 Links
              </h2>
              <div className="feature-details-links-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "16px"
              }}>
                {feature.links.map((l) => (
                  <a 
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feature-details-resource-card"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      border: "1px solid #eee",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      display: "block"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#333", margin: "0 0 4px 0" }}>
                      🔗 {l.title}
                    </p>
                    {l.description && (
                      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                        {l.description}
                      </p>
                    )}
                    <p style={{ fontSize: "11px", color: "#999", margin: "0" }}>
                      {l.viewed ? "Viewed" : "Not viewed"} • {l.views} views
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
              Details
            </h2>
            <div className="feature-details-meta-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: `2px solid ${sm.color}20`
              }}>
                <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                  Status
                </p>
                <p style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0",
                  color: sm.color
                }}>
                  {sm.icon} {sm.label}
                </p>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: `2px solid ${priorityColor}20`
              }}>
                <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                  Submitted Date
                </p>
                <p style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0",
                  color: "#333"
                }}>
                  {formatDate(feature.createdAt)}
                </p>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "2px solid #5B7FFF20"
              }}>
                <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                  Feature ID
                </p>
                <p style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  margin: "0",
                  color: "#666",
                  fontFamily: "monospace"
                }}>
                  {feature.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="feature-details-sidebar">
          
          {/* Summary Card */}
          <div className="feature-details-sticky-card" style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#999", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              Overview
            </h3>
            
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "#999", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>Priority</p>
              <p style={{ fontSize: "16px", fontWeight: "700", margin: "0", color: priorityColor }}>
                {feature.priority}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "#999", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>Status</p>
              <p style={{ fontSize: "16px", fontWeight: "700", margin: "0", color: sm.color }}>
                {feature.status}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "11px", color: "#999", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>Created</p>
              <p style={{ fontSize: "14px", fontWeight: "600", margin: "0", color: "#333" }}>
                {formatDate(feature.createdAt)}
              </p>
            </div>
          </div>

          {/* Media Summary */}
          {(feature.videos?.length > 0 || feature.videoFiles?.length > 0 || feature.imageClips?.length > 0 || feature.links?.length > 0) && (
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#999", textTransform: "uppercase", margin: "0 0 16px 0" }}>
                Resources
              </h3>

              {feature.videos?.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#333", margin: "0 0 6px 0" }}>
                    📹 Videos
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: "0" }}>
                    {feature.videos.length} video{feature.videos.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {feature.videoFiles?.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#333", margin: "0 0 6px 0" }}>
                    🎬 Video Clips
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: "0" }}>
                    {feature.videoFiles.length} clip{feature.videoFiles.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {feature.imageClips?.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#333", margin: "0 0 6px 0" }}>
                    🖼️ Images
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: "0" }}>
                    {feature.imageClips.length} image{feature.imageClips.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {feature.links?.length > 0 && (
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#333", margin: "0 0 6px 0" }}>
                    🔗 Links
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: "0" }}>
                    {feature.links.length} link{feature.links.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
