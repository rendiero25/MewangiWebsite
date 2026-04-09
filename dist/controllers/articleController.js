const Article = require('../models/Article');
const ArticleComment = require('../models/ArticleComment');
const { getUploadedUrl } = require('../utils/uploadedMediaUrl');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get semua artikel (approved only)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 25, category, search } = req.query;
    const query = { $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] };

    if (category && category !== 'Semua') query.category = category;
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
      { slug: req.params.slug, $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar bio');

    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    const comments = await ArticleComment.find({ article: article._id })
      .populate('author', 'username avatar')
      .populate({
        path: 'quote',
        populate: { path: 'author', select: 'username' }
      })
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
      coverImage: req.file ? getUploadedUrl(req) : '',
      status: status === 'draft' ? 'draft' : 'pending',
    });

    await article.populate('author', 'username avatar');

    // Notify admins only if not draft AND author is not an admin themselves
    if (article.status === 'pending' && req.user.role !== 'admin') {
      const admins = await User.find({ role: 'admin' });
      await Promise.all(admins.map(admin => 
        Notification.create({
          recipient: admin._id,
          sender: req.user._id,
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
    if (req.file) article.coverImage = getUploadedUrl(req);
    article.status = status === 'draft' ? 'draft' : 'pending';
    article.rejectionReason = '';

    await article.save();
    await article.populate('author', 'username avatar');

    // Notify admins if not draft
    if (article.status === 'pending') {
      try {
        const admins = await User.find({ role: 'admin' });
        const socket = require('../socket');
        await Promise.all(admins.map(async (admin) => {
          const notification = await Notification.create({
            recipient: admin._id,
            sender: req.user._id,
            type: 'new_article_admin',
            message: `Artikel diedit (pending): "${article.title}" oleh ${req.user.username}`,
            link: `/admin`
          });
          socket.getIO().to(admin._id.toString()).emit('new_notification', notification);
        }));
      } catch (notifyErr) {
        console.error('Notification Error (Update Article):', notifyErr);
      }
    }

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
    const article = await Article.findOne({
      _id: req.params.id,
      $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }]
    });

    if (!article) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    const comment = await ArticleComment.create({
      content: req.body.content,
      article: article._id,
      author: req.user._id,
      quote: req.body.quoteId || null,
      image: req.file ? getUploadedUrl(req) : '',
    });

    await comment.populate('author', 'username avatar');

    // Notify article author (if not the commenter)
    if (article.author.toString() !== req.user._id.toString()) {
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
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah komentar', error: error.message });
  }
};

// @desc    Like komentar artikel
// @route   POST /api/articles/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await ArticleComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Komentar tidak ditemukan' });

    const userId = req.user._id;
    comment.dislikes = (comment.dislikes || []).filter(id => id.toString() !== userId.toString());

    if ((comment.likes || []).map(id => id.toString()).includes(userId.toString())) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes = comment.likes || [];
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyukai komentar', error: error.message });
  }
};

// @desc    Dislike komentar artikel
// @route   POST /api/articles/comments/:id/dislike
// @access  Private
const dislikeComment = async (req, res) => {
  try {
    const comment = await ArticleComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Komentar tidak ditemukan' });

    const userId = req.user._id;
    comment.likes = (comment.likes || []).filter(id => id.toString() !== userId.toString());

    if ((comment.dislikes || []).map(id => id.toString()).includes(userId.toString())) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.dislikes = comment.dislikes || [];
      comment.dislikes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (error) {
    res.status(500).json({ message: 'Gagal tidak menyukai komentar', error: error.message });
  }
};

// @desc    Get top categories artikel
// @route   GET /api/articles/meta/top-categories
// @access  Public
const getTopCategories = async (req, res) => {
  try {
    const categories = await Article.aggregate([
      { $match: { $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(categories.map(c => ({ name: c._id, count: c.count })));
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: error.message });
  }
};

// @desc    Get related articles
// @route   GET /api/articles/detail/:id/related
// @access  Public
const getRelatedArticles = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Artikel tidak ditemukan' });

    const related = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
      $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }]
    })
    .limit(5)
    .select('title slug createdAt');

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel terkait', error: error.message });
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

// @desc    Like artikel
// @route   POST /api/articles/:id/like
// @access  Private
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) return res.status(404).json({ message: "Artikel tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(article.author);

    let repChange = 0;
    let reactChange = 0;

    if (article.dislikes.includes(userId)) {
      article.dislikes = article.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    }

    if (article.likes.includes(userId)) {
      article.likes = article.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    } else {
      article.likes.push(userId);
      repChange += 1;
      reactChange += 1;
    }

    await article.save();

    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: article.likes, dislikes: article.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyukai artikel", error: error.message });
  }
};

// @desc    Dislike artikel
// @route   POST /api/articles/:id/dislike
// @access  Private
const dislikeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) return res.status(404).json({ message: "Artikel tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(article.author);

    let repChange = 0;
    let reactChange = 0;

    if (article.likes.includes(userId)) {
      article.likes = article.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    }

    if (article.dislikes.includes(userId)) {
      article.dislikes = article.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    } else {
      article.dislikes.push(userId);
      repChange -= 1;
    }

    await article.save();

    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: article.likes, dislikes: article.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal tidak menyukai artikel", error: error.message });
  }
};

// @desc    Get top articles (trending)
// @route   GET /api/articles/meta/top-titles
// @access  Public
const getTopArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }]
    })
    .sort({ views: -1 })
    .limit(5)
    .select('title slug views createdAt');

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel terpopuler', error: error.message });
  }
};

module.exports = { 
  getArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle, 
  getMyArticles, addArticleComment, deleteArticleComment,
  likeComment, dislikeComment, getTopCategories, getRelatedArticles,
  likeArticle, dislikeArticle, getTopArticles
};
