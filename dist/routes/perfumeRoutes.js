const express = require('express');
const router = express.Router();
const Perfume = require('../models/Perfume');

// @desc    Get semua parfum
// @route   GET /api/perfumes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, brand, gender, concentration } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (brand) query.brand = brand;
    if (gender) query.gender = gender;
    if (concentration) query.concentration = concentration;

    const perfumes = await Perfume.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Perfume.countDocuments(query);

    res.json({
      perfumes,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil parfum', error: error.message });
  }
});

// @desc    Get parfum by ID
// @route   GET /api/perfumes/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ message: 'Parfum tidak ditemukan' });
    }
    res.json(perfume);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil parfum', error: error.message });
  }
});

module.exports = router;
