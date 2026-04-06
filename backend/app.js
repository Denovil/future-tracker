const express = require('express');
const cors = require('cors');
require('dotenv').config();

const featureRoutes = require('./routes/features');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/features', featureRoutes);
app.use('/api/auth', authRoutes);

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
