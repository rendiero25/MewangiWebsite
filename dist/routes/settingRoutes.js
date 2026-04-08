const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/adminController');

/**
  * Public Settings Route
  */

// GET /api/settings
router.get('/', getPublicSettings);

module.exports = router;
