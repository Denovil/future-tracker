const express = require('express');
const router = express.Router();

// Try to initialize Firebase Admin SDK (optional - server runs fine without it)
let admin = null;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
} catch (err) {
  console.warn('Firebase Admin SDK not initialized (optional):', err.message);
}

// Simple admin login route
router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();

  if (username === 'admin' && password === 'admin') {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

module.exports = router;
