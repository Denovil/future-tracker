const express = require('express');
const router = express.Router();

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
