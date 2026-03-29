const Article = require('../models/Article');
const ArticleComment = require('../models/ArticleComment');
const Notification = require('../models/Notification');
const User = require('../models/User');

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

    const comments = await ArticleComment.find({ article: article._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({ ...article.toObject(), comments });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

// @desc    Get artikel by ID (untuk admin/author edit via dashboard)
// @route   GET /api/articles/edit/:id
// @access  Private
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
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

    // Notify admins (only if not draft)
    if (article.status === 'pending') {
      const admins = await User.find({ role: 'admin' });
      await Promise.all(admins.map(admin => 
        Notification.create({
          recipient: admin._id,
          type: 'new_article_admin',
          message: `Artikel baru pending: "${article.title}" oleh ${req.user.username}`,
          link: `/admin`
        })
      ));
    }

    res.status(201).json({
      message: article.status === 'draft'
        ? 'Artikel disimpan sebagai draft.'
        : 'Artikel berhasil dikirim! Menunggu approval admin.',
      article,
    });
  } catch (error) {
    console.error('Create Article Error:', error);
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
    article.rejectionReason = '';

    await article.save();
    await article.populate('author', 'username avatar');

    res.json(article);
  } catch (error) {
    console.error('Update Article Error:', error);
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

// @desc    Tambah komentar ke artikel
// @route   POST /api/articles/:id/comments
// @access  Private (verified member)
const addArticleComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article || article.status !== 'approved') {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    const comment = await ArticleComment.create({
      content: req.body.content,
      article: article._id,
      author: req.user._id,
    });

    await comment.populate('author', 'username avatar');

    console.log(`[Notification] Triggered for article: ${article._id}. Author: ${article.author}. Commenter: ${req.user._id}`);
    const notification = await Notification.create({
      recipient: article.author,
      sender: req.user._id,
      type: 'comment_article',
      message: `${req.user.username} mengomentari artikel Anda: "${article.title}"`,
      link: `/blog/${article.slug}`
    });

    const socket = require('../socket');
    socket.getIO().to(article.author.toString()).emit('new_notification', notification);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah komentar', error: error.message });
  }
};

// @desc    Hapus komentar dari artikel
// @route   DELETE /api/articles/comments/:commentId
// @access  Private (author / admin)
const deleteArticleComment = async (req, res) => {
  try {
    const comment = await ArticleComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    await ArticleComment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus komentar', error: error.message });
  }
};

module.exports = { getArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle, getMyArticles, addArticleComment, deleteArticleComment };
