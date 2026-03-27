const Article = require('../models/Article');

// @desc    Get semua artikel (approved only)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = { status: 'approved' };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const articles = await Article.find(query)
      .populate('author', 'username avatar')
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

// @desc    Get artikel by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, status: 'approved' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar bio');

    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

// @desc    Buat artikel baru (perlu approval admin)
// @route   POST /api/articles
// @access  Private (verified member)
const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status } = req.body;

    const article = await Article.create({
      title,
      content,
      excerpt,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      author: req.user._id,
      coverImage: req.file ? `/uploads/${req.file.filename}` : '',
      status: status === 'draft' ? 'draft' : 'pending',
    });

    await article.populate('author', 'username avatar');

    res.status(201).json({
      message: article.status === 'draft'
        ? 'Artikel disimpan sebagai draft.'
        : 'Artikel berhasil dikirim! Menunggu approval admin.',
      article,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat artikel', error: error.message });
  }
};

// @desc    Update artikel
// @route   PUT /api/articles/:id
// @access  Private (author only)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    const { title, content, excerpt, category, tags, status } = req.body;
    article.title = title || article.title;
    article.content = content || article.content;
    article.excerpt = excerpt || article.excerpt;
    article.category = category || article.category;
    if (tags) article.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (req.file) article.coverImage = `/uploads/${req.file.filename}`;
    article.status = status === 'draft' ? 'draft' : 'pending';

    await article.save();
    await article.populate('author', 'username avatar');

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate artikel', error: error.message });
  }
};

// @desc    Hapus artikel
// @route   DELETE /api/articles/:id
// @access  Private (author / admin)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus artikel', error: error.message });
  }
};

// @desc    Get my articles (untuk member dashboard)
// @route   GET /api/articles/my
// @access  Private
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .select('-content')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle, getMyArticles };
