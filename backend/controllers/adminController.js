const User = require('../models/User');
const Review = require('../models/Review');
const Article = require('../models/Article');
const Perfume = require('../models/Perfume');

// ==================== APPROVAL ====================

// @desc    Get pending reviews
// @route   GET /api/admin/reviews/pending
// @access  Private (admin only)
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('author', 'username email avatar')
      .populate('perfume', 'name brand')
      .sort({ createdAt: 1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil review', error: error.message });
  }
};

// @desc    Approve/Reject review
// @route   PUT /api/admin/reviews/:id/status
// @access  Private (admin only)
const updateReviewStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status harus approved atau rejected' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    review.status = status;
    if (status === 'rejected' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }
    await review.save();

    // Update rating di Perfume jika approved
    if (status === 'approved') {
      const approvedReviews = await Review.find({ perfume: review.perfume, status: 'approved' });
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating.overall, 0);
      await Perfume.findByIdAndUpdate(review.perfume, {
        averageRating: (totalRating / approvedReviews.length).toFixed(1),
        totalReviews: approvedReviews.length,
      });
    }

    res.json({ message: `Review berhasil di-${status}`, review });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status review', error: error.message });
  }
};

// @desc    Get pending articles
// @route   GET /api/admin/articles/pending
// @access  Private (admin only)
const getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending' })
      .populate('author', 'username email avatar')
      .sort({ createdAt: 1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

// @desc    Approve/Reject article
// @route   PUT /api/admin/articles/:id/status
// @access  Private (admin only)
const updateArticleStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status harus approved atau rejected' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    article.status = status;
    if (status === 'rejected' && rejectionReason) {
      article.rejectionReason = rejectionReason;
    }
    await article.save();

    res.json({ message: `Artikel berhasil di-${status}`, article });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status artikel', error: error.message });
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get semua user
// @route   GET /api/admin/users
// @access  Private (admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil users', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role harus member atau admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: `Role user berhasil diubah ke ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah role', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Tidak bisa menghapus admin' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus user', error: error.message });
  }
};

// ==================== PERFUME MANAGEMENT ====================

// @desc    Create perfume
// @route   POST /api/admin/perfumes
// @access  Private (admin only)
const createPerfume = async (req, res) => {
  try {
    const { name, brand, description, topNotes, middleNotes, baseNotes, concentration, year, gender } = req.body;

    const perfume = await Perfume.create({
      name,
      brand,
      description,
      topNotes: topNotes ? (Array.isArray(topNotes) ? topNotes : topNotes.split(',').map(n => n.trim())) : [],
      middleNotes: middleNotes ? (Array.isArray(middleNotes) ? middleNotes : middleNotes.split(',').map(n => n.trim())) : [],
      baseNotes: baseNotes ? (Array.isArray(baseNotes) ? baseNotes : baseNotes.split(',').map(n => n.trim())) : [],
      concentration,
      year,
      gender,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user._id,
    });

    res.status(201).json(perfume);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat parfum', error: error.message });
  }
};

// @desc    Update perfume
// @route   PUT /api/admin/perfumes/:id
// @access  Private (admin only)
const updatePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ message: 'Parfum tidak ditemukan' });
    }

    const { name, brand, description, topNotes, middleNotes, baseNotes, concentration, year, gender } = req.body;
    perfume.name = name || perfume.name;
    perfume.brand = brand || perfume.brand;
    perfume.description = description || perfume.description;
    if (topNotes) perfume.topNotes = Array.isArray(topNotes) ? topNotes : topNotes.split(',').map(n => n.trim());
    if (middleNotes) perfume.middleNotes = Array.isArray(middleNotes) ? middleNotes : middleNotes.split(',').map(n => n.trim());
    if (baseNotes) perfume.baseNotes = Array.isArray(baseNotes) ? baseNotes : baseNotes.split(',').map(n => n.trim());
    if (concentration) perfume.concentration = concentration;
    if (year) perfume.year = year;
    if (gender) perfume.gender = gender;
    if (req.file) perfume.image = `/uploads/${req.file.filename}`;

    await perfume.save();

    res.json(perfume);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate parfum', error: error.message });
  }
};

// @desc    Delete perfume
// @route   DELETE /api/admin/perfumes/:id
// @access  Private (admin only)
const deletePerfume = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ message: 'Parfum tidak ditemukan' });
    }

    await Perfume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parfum berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus parfum', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin only)
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPerfumes, pendingReviews, pendingArticles] = await Promise.all([
      User.countDocuments(),
      Perfume.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Article.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      totalUsers,
      totalPerfumes,
      pendingReviews,
      pendingArticles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};

module.exports = {
  getPendingReviews, updateReviewStatus,
  getPendingArticles, updateArticleStatus,
  getUsers, updateUserRole, deleteUser,
  createPerfume, updatePerfume, deletePerfume,
  getDashboardStats,
};
