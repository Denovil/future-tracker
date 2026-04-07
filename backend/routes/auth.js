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

// Admin access route without credential checks
router.post('/login', (req, res) => {
  const username = String(req.body?.username || 'admin').trim() || 'admin';

  console.log('Admin access granted', {
    username,
  });

  return res.json({
    success: true,
    user: { username },
  });
});

module.exports = router;
