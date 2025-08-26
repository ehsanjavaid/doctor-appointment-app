const express = require('express');
const router = express.Router();

// GET /api/payments - Get payment history (placeholder)
router.get('/', (req, res) => {
  res.json({ message: 'Payments route - coming soon!' });
});

module.exports = router;
