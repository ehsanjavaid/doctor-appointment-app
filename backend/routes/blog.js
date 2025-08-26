const express = require('express');
const router = express.Router();

// GET /api/blog - Get blog posts (placeholder)
router.get('/', (req, res) => {
  res.json({ message: 'Blog route - coming soon!' });
});

module.exports = router;
