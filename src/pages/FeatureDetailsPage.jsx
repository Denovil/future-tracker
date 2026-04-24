import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate, getStatusLabel, getStatusMeta } from "../utils/constants";
import { toApiAssetUrl } from "../utils/api";
import ImageCarousel from "../components/ImageCarousel";
import { getFeatureImageSources } from "../utils/featureImages";
import { getDisplayPrice, getPriceValue, getSellerName } from "../utils/marketplace";

const PAYMENT_METHODS = [
  { id: "mobile", label: "Mobile Money", note: "Choose M-Pesa, Airtel Money, Mixx by Yas, and more" },
  { id: "card", label: "Card", note: "Feature is coming soon" },
];

const CARD_BANK_OPTIONS = [
  { id: "visa-mastercard", label: "Visa/Mastercard", icon: "Card" },
];

const MOBILE_MONEY_OPTIONS = [
  {
    id: "mpesa",
    label: "M-Pesa",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/960px-M-PESA_LOGO-01.svg.png",
    fallback: "MP",
  },
  {
    id: "airtel-money",
    label: "Airtel Money",
    logoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Bharti_Airtel_logo.svg",
    fallback: "AM",
  },
  {
    id: "mixx-by-yas",
    label: "Mixx by Yas",
    logoUrl: "https://static.wikia.nocookie.net/logopedia/images/5/50/Mixx_by_Yas.png/revision/latest/scale-to-width-down/72?cb=20251013231833",
    fallback: "MY",
  },
  {
    id: "halopesa",
    label: "HaloPesa",
    logoUrl: "https://images.seeklogo.com/logo-png/62/1/halopesa-logo-png_seeklogo-625628.png",
    fallback: "HP",
  },
  { id: "other-mobile", label: "Other Mobile", fallback: "MM" },
];

const formatCurrencyAmount = (value) =>
  `TZS ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value || 0)))}`;

const parseMoneyInput = (value) => {
  const numeric = Number(String(value ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(numeric)) return null;
  return numeric;
};

export default function FeatureDetailsPage({ features }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [selectedBankProvider, setSelectedBankProvider] = useState("visa-mastercard");
  const [selectedMobileProvider, setSelectedMobileProvider] = useState("mpesa");
  const [brokenLogos, setBrokenLogos] = useState({});
  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [mobilePhone, setMobilePhone] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    country: "Tanzania",
    region: "",
    city: "",
    street: "",
    postalCode: "",
    notes: "",
  });

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

  const sm = getStatusMeta(feature.status);
  const statusLabel = getStatusLabel(feature.status);
  const itemPrice = getPriceValue(feature);
  const featureImages = useMemo(() => getFeatureImageSources(feature), [feature]);
  const enteredAmount = parseMoneyInput(paymentAmount);
  const payableAmount = enteredAmount != null && enteredAmount > 0 ? enteredAmount : null;
  const isCardFeatureComingSoon = paymentMethod === "card";
  const isAddressIncomplete = !shippingAddress.fullName.trim()
    || !shippingAddress.phone.trim()
    || !shippingAddress.country.trim()
    || !shippingAddress.city.trim()
    || !shippingAddress.street.trim();

  useEffect(() => {
    if (itemPrice != null) {
      setPaymentAmount(String(Math.max(0, Math.round(itemPrice))));
    } else {
      setPaymentAmount("");
    }
  }, [itemPrice, feature?.id]);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (checkoutError) setCheckoutError("");
  };

  const openCheckout = () => {
    setCheckoutError("");
    setCheckoutSuccess("");
    if (itemPrice != null) {
      setPaymentAmount(String(Math.max(0, Math.round(itemPrice))));
    }
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    if (isPaying) return;
    setIsCheckoutOpen(false);
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    setCheckoutError("");
    setCheckoutSuccess("");

    if (payableAmount == null) {
      setCheckoutError("Enter a valid amount to pay.");
      return;
    }

    if (!shippingAddress.fullName.trim()) {
      setCheckoutError("Enter full name for delivery address.");
      return;
    }
    const addressPhoneDigits = shippingAddress.phone.replace(/\D/g, "");
    if (addressPhoneDigits.length < 9 || addressPhoneDigits.length > 13) {
      setCheckoutError("Enter a valid address phone number.");
      return;
    }
    if (!shippingAddress.country.trim() || !shippingAddress.city.trim() || !shippingAddress.street.trim()) {
      setCheckoutError("Complete country, city, and street address before payment.");
      return;
    }

    if (paymentMethod === "card") {
      setCheckoutError("Card feature is coming soon.");
      return;
    }

    if (paymentMethod === "mobile") {
      const mobileProvider = MOBILE_MONEY_OPTIONS.find((option) => option.id === selectedMobileProvider);
      if (!mobileProvider) {
        setCheckoutError("Choose a mobile money option before paying.");
        return;
      }
      const digits = mobilePhone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) {
        setCheckoutError("Enter a valid mobile money number.");
        return;
      }
    }

    setIsPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const providerLabel = paymentMethod === "card"
      ? CARD_BANK_OPTIONS.find((option) => option.id === selectedBankProvider)?.label
      : MOBILE_MONEY_OPTIONS.find((option) => option.id === selectedMobileProvider)?.label;
    const reference = `FT-${String(Date.now()).slice(-8)}`;
    setCheckoutSuccess(
      `Payment of ${formatCurrencyAmount(payableAmount)} via ${providerLabel || "selected method"} successful. Reference: ${reference}. Delivery to ${shippingAddress.city}, ${shippingAddress.country} confirmed.`
    );
    setIsPaying(false);
  };

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
          {featureImages.length > 0 && (
            <div style={{ marginBottom: 0 }}>
              <ImageCarousel
                images={featureImages}
                alt={feature.imageTitle || feature.title}
                autoPlay={featureImages.length > 1}
                intervalMs={4200}
                fit="contain"
                containerStyle={{
                  width: "100%",
                  height: "min(70vh, 520px)",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
                border: "2px solid #5B7FFF20"
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

              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "2px solid #f59e0b20"
              }}>
                <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                  Price
                </p>
                <p style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  margin: "0",
                  color: "#b45309"
                }}>
                  {getDisplayPrice(feature)}
                </p>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "2px solid #2563eb20"
              }}>
                <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                  Seller
                </p>
                <p style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0",
                  color: "#1e3a8a"
                }}>
                  {getSellerName(feature)}
                </p>
              </div>

              {feature.brand && (
                <div style={{
                  padding: "16px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "2px solid #10b98120"
                }}>
                  <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                    Brand
                  </p>
                  <p style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0",
                    color: "#0f766e"
                  }}>
                    {feature.brand}
                  </p>
                </div>
              )}

              {feature.condition && (
                <div style={{
                  padding: "16px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "2px solid #7c3aed20"
                }}>
                  <p style={{ fontSize: "12px", color: "#999", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: "600" }}>
                    Condition
                  </p>
                  <p style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0",
                    color: "#6d28d9"
                  }}>
                    {feature.condition}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="feature-details-sidebar">
          
          {/* Summary Card */}
          <div className="feature-details-sticky-card" style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(241,245,255,0.95))",
            border: "1px solid rgba(148,163,184,0.25)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
            backdropFilter: "blur(8px)",
            marginBottom: "24px",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#334155",
              textTransform: "uppercase",
              margin: "0 0 16px 0",
              letterSpacing: "0.06em",
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span
                className="material-symbols-rounded"
                aria-hidden="true"
                style={{
                  fontSize: "16px",
                  color: "#16a34a",
                  fontVariationSettings: "\"FILL\" 1, \"wght\" 700, \"GRAD\" 0, \"opsz\" 20",
                }}
              >
                dashboard
              </span>
              Overview
            </h3>
            
            <div style={{ marginBottom: "16px", display: "grid", gap: "10px" }}>
              <div style={{
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.78)",
                padding: "10px 12px",
              }}>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0 0 4px 0",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "14px" }}>
                    verified
                  </span>
                  Status
                </p>
                <p style={{ fontSize: "16px", fontWeight: "800", margin: "0", color: sm.color, fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                  {statusLabel}
                </p>
              </div>

              <div style={{
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.78)",
                padding: "10px 12px",
              }}>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0 0 4px 0",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "14px" }}>
                    calendar_month
                  </span>
                  Created
                </p>
                <p style={{ fontSize: "14px", fontWeight: "700", margin: "0", color: "#1f2937", fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                  {formatDate(feature.createdAt)}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <p style={{
                fontSize: "11px",
                color: "#64748b",
                margin: "0 0 6px 0",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "14px" }}>
                  payments
                </span>
                Price
              </p>
              <p style={{ fontSize: "20px", fontWeight: "900", margin: "0", color: "#b45309", fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                {getDisplayPrice(feature)}
              </p>
            </div>

            <button
              type="button"
              onClick={openCheckout}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "10px",
                padding: "12px 14px",
                backgroundColor: "#f97316",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "14px",
                boxShadow: "0 10px 18px rgba(249,115,22,0.28)",
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "17px" }}>
                  shopping_cart_checkout
                </span>
                Pay Online
              </span>
            </button>
            {itemPrice == null && (
              <p style={{ fontSize: "11px", color: "#64748b", margin: "10px 0 0 0", lineHeight: "1.5" }}>
                Seller has no fixed price yet. Enter your amount at checkout.
              </p>
            )}
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(148,163,184,0.25)", display: "grid", gap: "4px" }}>
              <p style={{ fontSize: "11px", color: "#475569", margin: "0", lineHeight: "1.6", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "13px" }}>
                  shield_lock
                </span>
                Secure checkout with buyer protection
              </p>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "0", lineHeight: "1.6" }}>
                Encrypted payment details and instant confirmation.
              </p>
            </div>
            {checkoutError && !isCheckoutOpen && (
              <p style={{ fontSize: "11px", color: "#dc2626", margin: "10px 0 0 0", lineHeight: "1.5" }}>
                {checkoutError}
              </p>
            )}
          </div>

          {/* Media Summary */}
          {(feature.videos?.length > 0 || feature.videoFiles?.length > 0 || feature.imageClips?.length > 0 || feature.links?.length > 0) && (
            <div style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.98), rgba(238,242,255,0.94))",
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 10px 24px rgba(15,23,42,0.10)"
            }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#334155",
                textTransform: "uppercase",
                margin: "0 0 16px 0",
                letterSpacing: "0.06em",
                fontFamily: "'Nunito', 'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span aria-hidden="true">📦</span>
                Resources
              </h3>

              {feature.videos?.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px 0", fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                    📹 Videos
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "0" }}>
                    {feature.videos.length} video{feature.videos.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {feature.videoFiles?.length > 0 && (
                <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px 0", fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                    🎬 Video Clips
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "0" }}>
                    {feature.videoFiles.length} clip{feature.videoFiles.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {feature.links?.length > 0 && (
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px 0", fontFamily: "'Nunito', 'DM Sans', sans-serif" }}>
                    🔗 Links
                  </p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "0" }}>
                    {feature.links.length} link{feature.links.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {isCheckoutOpen && (
        <div
          onClick={closeCheckout}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "920px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 22px 56px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              maxHeight: "calc(100vh - 24px)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#1f2937", fontWeight: "800" }}>Secure Checkout</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                  Complete your payment safely like major online marketplaces.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                disabled={isPaying}
                style={{
                  border: "1px solid #d1d5db",
                  backgroundColor: "#fff",
                  color: "#374151",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  cursor: isPaying ? "not-allowed" : "pointer",
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                  gap: "18px",
                  padding: "20px",
                  overflowY: "auto",
                  minHeight: 0,
                }}
              >
                <section
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Order Summary
                  </p>
                  <p style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#111827", fontWeight: "700" }}>{feature.title}</p>
                  <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "#6b7280" }}>
                    Sold by {getSellerName(feature)}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#4b5563" }}>Item price</span>
                    <strong style={{ fontSize: "13px", color: "#111827" }}>
                      {itemPrice == null ? "Not fixed" : formatCurrencyAmount(itemPrice)}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#111827", fontWeight: "700" }}>Total</span>
                    <strong style={{ fontSize: "16px", color: "#b45309" }}>
                      {payableAmount == null ? "Enter amount" : formatCurrencyAmount(payableAmount)}
                    </strong>
                  </div>

                  <div style={{ marginTop: "14px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#059669", fontWeight: "700" }}>Buyer Protection</p>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#4b5563" }}>Encrypted payment checkout</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#4b5563" }}>Order confirmation with payment reference</p>
                  </div>
                </section>

                <section>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                    Delivery Address
                  </p>
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      borderRadius: "12px",
                      padding: "12px",
                      display: "grid",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="Full name"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="Phone number"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        placeholder="Country"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        name="region"
                        value={shippingAddress.region}
                        onChange={handleAddressChange}
                        placeholder="Region/State"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                    </div>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      placeholder="Street address, house/building"
                      style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px" }}>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleAddressChange}
                        placeholder="Postal"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        name="notes"
                        value={shippingAddress.notes}
                        onChange={handleAddressChange}
                        placeholder="Address note (optional)"
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                    Payment Method
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.id);
                          setCheckoutSuccess("");
                          setCheckoutError("");
                        }}
                        style={{
                          border: paymentMethod === method.id ? "1px solid #f97316" : "1px solid #d1d5db",
                          backgroundColor: paymentMethod === method.id ? "#fff7ed" : "#fff",
                          borderRadius: "999px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: paymentMethod === method.id ? "#c2410c" : "#374151",
                          cursor: "pointer",
                        }}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#6b7280" }}>
                    {PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.note}
                  </p>

                  {paymentMethod === "card" && (
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          borderRadius: "0",
                          padding: "2px 0",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "13px", color: "#000000", fontWeight: "800" }}>
                          This feature is coming soon....
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mobile" && (
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                        {MOBILE_MONEY_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedMobileProvider(option.id)}
                            style={{
                              border: selectedMobileProvider === option.id ? "1px solid #f97316" : "1px solid #d1d5db",
                              backgroundColor: selectedMobileProvider === option.id ? "#fff7ed" : "#fff",
                              borderRadius: "10px",
                              padding: "10px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: selectedMobileProvider === option.id ? "#c2410c" : "#374151",
                            }}
                          >
                            <span
                              style={{
                                width: "44px",
                                height: "24px",
                                borderRadius: "4px",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {option.logoUrl && !brokenLogos[option.id] ? (
                                <img
                                  src={option.logoUrl}
                                  alt={`${option.label} logo`}
                                  loading="lazy"
                                  onError={() => {
                                    setBrokenLogos((prev) => ({ ...prev, [option.id]: true }));
                                  }}
                                  style={{
                                    width: "40px",
                                    height: "20px",
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    lineHeight: 1,
                                    textAlign: "center",
                                    color: "#0f766e",
                                  }}
                                >
                                  {option.fallback}
                                </span>
                              )}
                            </span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="tel"
                        value={mobilePhone}
                        onChange={(event) => setMobilePhone(event.target.value)}
                        placeholder={`${
                          MOBILE_MONEY_OPTIONS.find((option) => option.id === selectedMobileProvider)?.label || "Mobile money"
                        } number`}
                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                      />
                      <div>
                        <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#4b5563", fontWeight: "700" }}>
                          Amount to pay (TZS)
                        </p>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={paymentAmount}
                          onChange={(event) => {
                            setPaymentAmount(event.target.value);
                            setCheckoutError("");
                            setCheckoutSuccess("");
                          }}
                          placeholder="Enter amount"
                          style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}
                        />
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        You will receive a {MOBILE_MONEY_OPTIONS.find((option) => option.id === selectedMobileProvider)?.label} payment prompt on your phone.
                      </p>
                    </div>
                  )}

                  {checkoutError && (
                    <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: "#dc2626" }}>{checkoutError}</p>
                  )}
                  {checkoutSuccess && (
                    <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: "#047857", fontWeight: "700" }}>{checkoutSuccess}</p>
                  )}
                </section>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  padding: "14px 20px calc(14px + env(safe-area-inset-bottom))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  backgroundColor: "#fff",
                  position: "sticky",
                  bottom: 0,
                  zIndex: 2,
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                  Total to pay: <strong style={{ color: "#111827" }}>{payableAmount == null ? "Enter amount" : formatCurrencyAmount(payableAmount)}</strong>
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    disabled={isPaying}
                    style={{
                      border: "1px solid #d1d5db",
                      backgroundColor: "#fff",
                      color: "#374151",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      cursor: isPaying ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPaying || isCardFeatureComingSoon || isAddressIncomplete || payableAmount == null}
                    style={{
                      border: "none",
                      backgroundColor: isCardFeatureComingSoon || isAddressIncomplete || payableAmount == null ? "#9ca3af" : "#f97316",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      fontWeight: "700",
                      cursor: isPaying || isCardFeatureComingSoon || isAddressIncomplete || payableAmount == null ? "not-allowed" : "pointer",
                    }}
                  >
                    {payableAmount == null
                      ? "Enter Amount First"
                      : isAddressIncomplete
                      ? "Enter Address First"
                      : isCardFeatureComingSoon
                      ? "Feature Coming Soon"
                      : isPaying
                        ? "Processing payment..."
                        : "Submit Payment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



