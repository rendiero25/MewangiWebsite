const ForumTopic = require('../models/ForumTopic');
const ForumComment = require('../models/ForumComment');

// @desc    Get semua topik forum
// @route   GET /api/forum
// @access  Public
const getTopics = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const topics = await ForumTopic.find(query)
      .populate('author', 'username avatar')
      .sort({ isPinned: -1, lastReplyAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumTopic.countDocuments(query);

    res.json({
      topics,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik', error: error.message });
  }
};

// @desc    Get topik by ID + komentar
// @route   GET /api/forum/:id
// @access  Public
const getTopicById = async (req, res) => {
  try {
    const topic = await ForumTopic.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar');

    if (!topic) {
      return res.status(404).json({ message: 'Topik tidak ditemukan' });
    }

    const comments = await ForumComment.find({ topic: topic._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({ topic, comments });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik', error: error.message });
  }
};

// @desc    Buat topik baru
// @route   POST /api/forum
// @access  Private (verified member)
const createTopic = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const topic = await ForumTopic.create({
      title,
      content,
      category,
      author: req.user._id,
    });

    await topic.populate('author', 'username avatar');

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat topik', error: error.message });
  }
};

// @desc    Update topik
// @route   PUT /api/forum/:id
// @access  Private (author only)
const updateTopic = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topik tidak ditemukan' });
    }

    if (topic.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    const { title, content, category } = req.body;
    topic.title = title || topic.title;
    topic.content = content || topic.content;
    topic.category = category || topic.category;

    await topic.save();
    await topic.populate('author', 'username avatar');

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate topik', error: error.message });
  }
};

// @desc    Hapus topik
// @route   DELETE /api/forum/:id
// @access  Private (author / admin)
const deleteTopic = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topik tidak ditemukan' });
    }

    if (topic.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    // Hapus semua komentar di topik ini
    await ForumComment.deleteMany({ topic: topic._id });
    await ForumTopic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Topik berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus topik', error: error.message });
  }
};

// @desc    Tambah komentar ke topik
// @route   POST /api/forum/:id/comments
// @access  Private (verified member)
const addComment = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topik tidak ditemukan' });
    }

    if (topic.isClosed) {
      return res.status(403).json({ message: 'Topik sudah ditutup' });
    }

    const comment = await ForumComment.create({
      content: req.body.content,
      topic: topic._id,
      author: req.user._id,
      parentComment: req.body.parentComment || null,
    });

    // Update reply count dan lastReplyAt
    topic.replyCount += 1;
    topic.lastReplyAt = Date.now();
    await topic.save();

    await comment.populate('author', 'username avatar');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah komentar', error: error.message });
  }
};

// @desc    Hapus komentar
// @route   DELETE /api/forum/comments/:commentId
// @access  Private (author / admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    const topic = await ForumTopic.findById(comment.topic);
    if (topic) {
      topic.replyCount = Math.max(0, topic.replyCount - 1);
      await topic.save();
    }

    await ForumComment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus komentar', error: error.message });
  }
};

module.exports = { getTopics, getTopicById, createTopic, updateTopic, deleteTopic, addComment, deleteComment };
