const Review = require('../models/Review');
const ReviewComment = require('../models/ReviewComment');
const Perfume = require('../models/Perfume');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get semua review (approved only untuk public)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, perfume, search, occasion, season } = req.query;
    const query = { status: 'approved' };

    if (perfume) query.perfume = perfume;
    if (occasion) query.occasion = occasion;
    if (season) query.season = season;
    if (search) query.$text = { $search: search };

    const reviews = await Review.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil review', error: error.message });
  }
};

// @desc    Get review by ID + komentar
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('author', 'username avatar');

    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    const comments = await ReviewComment.find({ review: review._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({ review, comments });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil review', error: error.message });
  }
};

// @desc    Buat review baru (perlu approval admin)
// @route   POST /api/reviews
// @access  Private (verified member)
const createReview = async (req, res) => {
  try {
    const { title, content, occasion, season, perfume } = req.body;
    let rating = req.body.rating;
    
    // Parse rating fields bracket notation if form-data didn't map them
    if (!rating && req.body['rating[longevity]']) {
      rating = {
        longevity: Number(req.body['rating[longevity]']),
        sillage: Number(req.body['rating[sillage]']),
        valueForMoney: Number(req.body['rating[valueForMoney]']),
        overall: Number(req.body['rating[overall]'])
      };
    }

    const review = await Review.create({
      title,
      content,
      author: req.user._id,
      perfume: perfume || null,
      rating,
      occasion,
      season,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      status: 'pending',
    });

    await review.populate('author', 'username avatar');

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin => 
      Notification.create({
        recipient: admin._id,
        type: 'new_review_admin',
        message: `Review baru pending: "${review.title}" oleh ${req.user.username}`,
        link: `/admin`
      })
    ));

    res.status(201).json({
      message: 'Review berhasil dikirim! Menunggu approval admin.',
      review,
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Gagal membuat review', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (author only, hanya saat pending)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    const { title, content, occasion, season } = req.body;
    let rating = req.body.rating;
    if (!rating && req.body['rating[longevity]']) {
      rating = {
        longevity: Number(req.body['rating[longevity]']),
        sillage: Number(req.body['rating[sillage]']),
        valueForMoney: Number(req.body['rating[valueForMoney]']),
        overall: Number(req.body['rating[overall]'])
      };
    }
    review.title = title || review.title;
    review.content = content || review.content;
    review.rating = rating || review.rating;
    review.occasion = occasion || review.occasion;
    review.season = season || review.season;
    if (req.file) review.image = `/uploads/${req.file.filename}`;
    review.status = 'pending';
    review.rejectionReason = '';

    await review.save();
    await review.populate('author', 'username avatar');

    res.json(review);
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ message: 'Gagal mengupdate review', error: error.message });
  }
};

// @desc    Hapus review
// @route   DELETE /api/reviews/:id
// @access  Private (author / admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    await ReviewComment.deleteMany({ review: review._id });
    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus review', error: error.message });
  }
};

// @desc    Tambah komentar ke review
// @route   POST /api/reviews/:id/comments
// @access  Private (verified member)
const addReviewComment = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || review.status !== 'approved') {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }

    const comment = await ReviewComment.create({
      content: req.body.content,
      review: review._id,
      author: req.user._id,
    });

    await comment.populate('author', 'username avatar');

    // Notify review author (if not the commenter)
    if (review.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: review.author,
        sender: req.user._id,
        type: 'comment_review',
        message: `${req.user.username} mengomentari review Anda: "${review.title}"`,
        link: `/review/${review._id}`
      });

      const socket = require('../socket');
      socket.getIO().to(review.author.toString()).emit('new_notification', notification);
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah komentar', error: error.message });
  }
};

// @desc    Get my reviews (untuk member dashboard)
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil review', error: error.message });
  }
};

module.exports = { getReviews, getReviewById, createReview, updateReview, deleteReview, addReviewComment, getMyReviews };
