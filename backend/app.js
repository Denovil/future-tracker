const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const featureRoutes = require('./routes/features');
const authRoutes = require('./routes/auth');

const app = express();
const buildPath = path.join(__dirname, '../build');
const hasFrontendBuild = fs.existsSync(path.join(buildPath, 'index.html'));
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors(corsOrigin ? { origin: corsOrigin } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/features', featureRoutes);
app.use('/api/auth', authRoutes);

if (hasFrontendBuild) {
  app.use(express.static(buildPath));

  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Firebase Admin SDK setup for backend login support
try {
  require('firebase-admin');
} catch (e) {
  console.error('Please install firebase-admin: npm install firebase-admin');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Prevent process from exiting
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep server alive
server.keepAliveTimeout = 120000;
