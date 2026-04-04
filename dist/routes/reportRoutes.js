const express = require('express');
const router = express.Router();
const { createReport, getReports, resolveReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/reports
router.post('/', protect, createReport);

// @route   GET /api/reports
router.get('/', protect, admin, getReports);

// @route   PUT /api/reports/:id/resolve
router.put('/:id/resolve', protect, admin, resolveReport);

module.exports = router;
