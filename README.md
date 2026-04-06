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

## Render Deployment

This repo includes a Render blueprint at [render.yaml](/c:/Users/Ansi/Documents/GitHub/future-tracker/render.yaml) that deploys the frontend and backend together as one Node web service.

### Render settings

- Service type: `Web Service`
- Environment: `Node`
- Build command: `npm install && npm --prefix backend install && npm run build`
- Start command: `node backend/app.js`
- Health check path: `/health`

### Environment variables

- `PORT`: provided automatically by Render
- `CORS_ORIGIN`: optional, mainly useful for local development or if you later split frontend and backend into separate services

For local development, use [backend/.env.example](/c:/Users/Ansi/Documents/GitHub/future-tracker/backend/.env.example) as the template for `backend/.env`.

### Important notes

- Uploaded files are written to `backend/uploads`, so keep the Render disk attached if you want uploads to survive deploys and restarts.
- Feature records are currently stored only in memory in `backend/models/feature.js`, so any restart or redeploy will clear them. If you want permanent feature data, the backend needs a database-backed model next.
