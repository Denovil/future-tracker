import React, { useState, useEffect } from "react";

const PRESET_COLORS = [
  { name: "Deep Purple", value: "#0e0f11", accent: "#7c6af7", label: "Default" },
  { name: "Ocean Blue", value: "#0a0f1a", accent: "#3b82f6", label: "Ocean" },
  { name: "Forest Green", value: "#0a1108", accent: "#10b981", label: "Forest" },
  { name: "Midnight Red", value: "#130a0a", accent: "#ef4444", label: "Crimson" },
  { name: "Amber Dark", value: "#130f08", accent: "#f59e0b", label: "Amber" },
  { name: "Slate", value: "#0f1117", accent: "#64748b", label: "Slate" },
  { name: "Dark Gray", value: "#1a1a1a", accent: "#6b7280", label: "DkGray" },
  { name: "Pure White", value: "#ffffff", accent: "#6366f1", label: "White" },
  { name: "Light Cream", value: "#faf9f7", accent: "#8b5cf6", label: "Cream" },
  { name: "Pale Blue", value: "#f0f9ff", accent: "#0ea5e9", label: "SkyBlue" },
  { name: "Soft Mint", value: "#f0fdf4", accent: "#10b981", label: "Mint" },
  { name: "Light Rose", value: "#fdf2f8", accent: "#ec4899", label: "Rose" },
  { name: "Light Gray", value: "#f3f4f6", accent: "#6b7280", label: "LtGray" },
  { name: "Stone Gray", value: "#e5e7eb", accent: "#4b5563", label: "Stone" },
];

export default function BackgroundCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState("Default");
  const [customColor, setCustomColor] = useState("#0e0f11");
  const [customAccent, setCustomAccent] = useState("#7c6af7");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempBg, setTempBg] = useState("#0e0f11");
  const [tempAccent, setTempAccent] = useState("#7c6af7");

  // Load saved color from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bgCustomizer");
    if (saved) {
      const { label, bg, accent } = JSON.parse(saved);
      setActiveColor(label);
      setCustomColor(bg);
      setCustomAccent(accent);
      setTempBg(bg);
      setTempAccent(accent);
      applyColors(bg, accent);
    } else {
      applyColors(customColor, customAccent);
    }
  }, []);

  // Calculate if background is light or dark
  const isLightBackground = (color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  // Generate complementary accent color
  const generateComplementaryColor = (bgColor) => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    
    if (max === min) {
      h = 0;
    } else if (max === rNorm) {
      h = (60 * ((gNorm - bNorm) / (max - min)) + 360) % 360;
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / (max - min)) + 120;
    } else {
      h = 60 * ((rNorm - gNorm) / (max - min)) + 240;
    }
    
    // Adjust hue for complementary color
    h = (h + 180) % 360;
    
    // Convert back to RGB
    const s = max === 0 ? 0 : (max - min) / max;
    const l = max / 2;
    
    return hslToHex(h, s * 100, l * 100);
  };

  const hslToHex = (h, s, l) => {
    const c = ((1 - Math.abs(2 * l / 100 - 1)) * s) / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let r = 0, g = 0, b = 0;
    
    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const m = l / 100 - c / 2;
    const rDecimal = Math.round((r + m) * 255);
    const gDecimal = Math.round((g + m) * 255);
    const bDecimal = Math.round((b + m) * 255);
    
    return "#" + [rDecimal, gDecimal, bDecimal]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  };

  const applyColors = (bgColor, accentColor) => {
    const root = document.documentElement;
    const isLight = isLightBackground(bgColor);

    root.style.setProperty("--bg", bgColor);
    root.style.setProperty("--accent", accentColor);
    
    // Calculate derived colors
    const accentHover = adjustBrightness(accentColor, -0.15);
    root.style.setProperty("--accent-hover", accentHover);
    
    const accentGlow = `${accentColor}30`;
    root.style.setProperty("--accent-glow", accentGlow);

    // Adapt text colors based on background brightness
    if (isLight) {
      // Light background - use dark text
      root.style.setProperty("--text", "#1f2937");
      root.style.setProperty("--text-2", "#6b7280");
      root.style.setProperty("--text-3", "#9ca3af");
      root.style.setProperty("--border", "#e5e7eb");
      root.style.setProperty("--border-hover", "#d1d5db");
    } else {
      // Dark background - use light text (original)
      root.style.setProperty("--text", "#e8eaf0");
      root.style.setProperty("--text-2", "#8b8fa8");
      root.style.setProperty("--text-3", "#565a70");
      root.style.setProperty("--border", "#2a2d35");
      root.style.setProperty("--border-hover", "#3e4250");
    }

    // Update surface colors based on bg
    const surface = adjustBrightness(bgColor, isLight ? -0.08 : 0.15);
    const surface2 = adjustBrightness(bgColor, isLight ? -0.12 : 0.25);
    root.style.setProperty("--surface", surface);
    root.style.setProperty("--surface-2", surface2);
  };

  const adjustBrightness = (color, amount) => {
    const usePound = color[0] === "#";
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + (amount * 256)));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + (amount * 256)));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + (amount * 256)));
    return "#" + ((0x1000000 + r * 0x10000 + g * 0x100 + b) | 0).toString(16).slice(1);
  };

  const handlePresetClick = (preset) => {
    setActiveColor(preset.label);
    setCustomColor(preset.value);
    setCustomAccent(preset.accent);
    setTempBg(preset.value);
    setTempAccent(preset.accent);
    applyColors(preset.value, preset.accent);
    localStorage.setItem(
      "bgCustomizer",
      JSON.stringify({
        label: preset.label,
        bg: preset.value,
        accent: preset.accent,
      })
    );
  };

  const handleCustomColorChange = (e, type) => {
    const value = e.target.value;
    if (type === "bg") {
      setTempBg(value);
      setCustomColor(value);
      setActiveColor("Custom");
      applyColors(value, tempAccent);
    } else {
      setTempAccent(value);
      setCustomAccent(value);
      setActiveColor("Custom");
      applyColors(tempBg, value);
    }
  };

  const generateCompColor = () => {
    const compColor = generateComplementaryColor(tempBg);
    setTempAccent(compColor);
    setCustomAccent(compColor);
    setActiveColor("Custom");
    applyColors(tempBg, compColor);
  };

  const saveCustom = () => {
    localStorage.setItem(
      "bgCustomizer",
      JSON.stringify({
        label: "Custom",
        bg: customColor,
        accent: customAccent,
      })
    );
    alert("✅ Theme saved! It will be restored on next visit.");
  };

  const resetToDefault = () => {
    const defaultPreset = PRESET_COLORS[0];
    handlePresetClick(defaultPreset);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-customizer-toggle"
        title="Customize Theme & Colors"
        aria-label="Open theme customizer"
      >
        🎨
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="bg-customizer-panel">
          <div className="customizer-header">
            <h3>Theme Studio</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="customizer-close"
            >
              ✕
            </button>
          </div>

          {/* Dark Presets */}
          <div className="customizer-section">
            <label className="section-label">Dark Presets</label>
            <div className="presets-grid">
              {PRESET_COLORS.slice(0, 6).map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`preset-btn ${
                    activeColor === preset.label ? "active" : ""
                  }`}
                  title={preset.name}
                >
                  <div
                    className="preset-color"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gray Presets */}
          <div className="customizer-section">
            <label className="section-label">Gray Tones</label>
            <div className="presets-grid">
              {PRESET_COLORS.slice(6, 8).map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`preset-btn ${
                    activeColor === preset.label ? "active" : ""
                  }`}
                  title={preset.name}
                >
                  <div
                    className="preset-color"
                    style={{ 
                      backgroundColor: preset.value,
                      border: "1px solid #999"
                    }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Light Presets */}
          <div className="customizer-section">
            <label className="section-label">Light Presets</label>
            <div className="presets-grid">
              {PRESET_COLORS.slice(8).map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`preset-btn ${
                    activeColor === preset.label ? "active" : ""
                  }`}
                  title={preset.name}
                >
                  <div
                    className="preset-color"
                    style={{ 
                      backgroundColor: preset.value,
                      border: "1px solid #ccc"
                    }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="customizer-section">
            <label className="section-label">Custom Colors</label>
            <div className="color-row">
              <label>Background</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e, "bg")}
                  className="color-picker"
                />
                <code>{customColor}</code>
              </div>
            </div>
            <div className="color-row">
              <label>Accent</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => handleCustomColorChange(e, "accent")}
                  className="color-picker"
                />
                <code>{customAccent}</code>
              </div>
            </div>

            {/* Helper Button */}
            <button onClick={generateCompColor} className="helper-btn">
              🎯 Auto-Generate Accent
            </button>
          </div>

          {/* Preview */}
          <div className="customizer-section">
            <label className="section-label">Live Preview</label>
            <div
              className="preview-box"
              style={{
                backgroundColor: customColor,
              }}
            >
              <div className="preview-content">
                <div
                  className="preview-accent"
                  style={{
                    backgroundColor: customAccent,
                  }}
                />
                <p className="preview-text">Sample Text</p>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="customizer-section">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="toggle-advanced-btn"
            >
              {showAdvanced ? "▼" : "▶"} Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="advanced-options">
                <button onClick={saveCustom} className="save-btn">
                  💾 Save Theme
                </button>
                <button onClick={resetToDefault} className="reset-btn">
                  🔄 Reset to Default
                </button>
                <p className="help-text">
                  💡 Tip: Custom colors are saved automatically in your browser
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="customizer-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
