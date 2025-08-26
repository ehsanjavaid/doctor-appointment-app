const express = require('express');
const router = express.Router();

// GET /api/admin - Admin dashboard (placeholder)
router.get('/', (req, res) => {
  res.json({ message: 'Admin route - coming soon!' });
});

module.exports = router;
