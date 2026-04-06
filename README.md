# Feature Request Tracker

A clean, dark-themed full-stack-ready Feature Request Tracker built with React.

## ✨ Features
- **View** all feature requests in a responsive card grid
- **Filter** by status (All / Open / In Progress / Completed)
- **Stats bar** showing totals at a glance
- **Persistent storage** via localStorage

## 📁 Project Structure

```
feature-tracker/
├── public/
│   └── index.html               # HTML shell + Google Fonts
├── src/
│   ├── data/
│   │   └── seedData.js          # 5 sample feature requests
│   ├── hooks/
│   │   └── useFeatures.js       # CRUD logic + localStorage
│   ├── utils/
│   │   └── constants.js         # Shared constants & helpers
│   ├── components/
│   │   ├── StatsBar.jsx         # Top summary stats
│   │   ├── FilterBar.jsx        # Status filter tabs
│   │   ├── FeatureCard.jsx      # Individual request card
│   │   ├── FeatureModal.jsx     # Add / Edit form modal
│   │   └── EmptyState.jsx       # Empty state display
│   ├── App.jsx                  # Root component
│   ├── index.js                 # ReactDOM entry point
│   └── index.css                # All global styles
├── feature-tracker.html         # ✅ Standalone version (open directly)
├── package.json
└── README.md
```

## 🚀 Quick Start

### Option A — Open Directly (no install needed)
Just open `feature-tracker.html` in any modern browser. Done.

### Option B — React Dev Server
```bash
cd feature-tracker
npm install
npm start
```
Then open http://localhost:3000

### Option C — Production Build
```bash
npm run build
# Serve the /build folder with any static server
```

## 🎨 Design
- **Dark theme** with CSS variables for easy theming
- **Fonts**: Syne (display) + DM Mono (body)
- **Animations**: card entrance, modal spring, pulse empty state
- **Responsive**: adapts to mobile at 600px