const express = require('express');
const router = express.Router();

// GET /api/reviews - Get reviews (placeholder)
router.get('/', (req, res) => {
  res.json({ message: 'Reviews route - coming soon!' });
});

module.exports = router;
