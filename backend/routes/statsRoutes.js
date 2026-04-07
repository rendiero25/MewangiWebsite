const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/statsController');

/**
 * Public Statistics Route
 */

// GET /api/stats
router.get('/', getPublicStats);

module.exports = router;
