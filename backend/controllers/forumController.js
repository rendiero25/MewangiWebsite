const ForumTopic = require('../models/ForumTopic');
const ForumComment = require('../models/ForumComment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get semua topik forum
// @route   GET /api/forum
// @access  Public
const getTopics = async (req, res) => {
  try {
    const { page = 1, limit = 25, category, search } = req.query; // Default limit 25
    const query = { status: 'approved' };

    if (category && category !== 'Semua') query.category = category;
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
    const topic = await ForumTopic.findOneAndUpdate(
      { _id: req.params.id, status: 'approved' },
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

// @desc    Get topik by ID (untuk admin/author edit via dashboard)
// @route   GET /api/forum/edit/:id
// @access  Private
const getTopicForEdit = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topik tidak ditemukan' });
    
    if (topic.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    res.json(topic);
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

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin => 
      Notification.create({
        recipient: admin._id,
        type: 'system',
        message: `Topik baru pending: "${topic.title}" oleh ${req.user.username}`,
        link: `/admin`
      })
    ));

    res.status(201).json(topic);
  } catch (error) {
    console.error('Create Topic Error:', error);
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
    topic.status = 'pending';
    topic.rejectionReason = '';

    await topic.save();
    await topic.populate('author', 'username avatar');

    res.json(topic);
  } catch (error) {
    console.error('Update Topic Error:', error);
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
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    // Update reply count dan lastReplyAt
    topic.replyCount += 1;
    topic.lastReplyAt = Date.now();
    await topic.save();

    await comment.populate('author', 'username avatar');

    // Notify topic author (if not the commenter)
    if (topic.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: topic.author,
        sender: req.user._id,
        type: 'comment_forum',
        message: `${req.user.username} mengomentari topik Anda: "${topic.title}"`,
        link: `/forum/${topic._id}`
      });

      const socket = require('../socket');
      socket.getIO().to(topic.author.toString()).emit('new_notification', notification);
    }

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

// @desc    Get my topics (untuk member dashboard)
// @route   GET /api/forum/my/list
// @access  Private
const getMyTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find({ author: req.user._id })
      .select('-content')
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik', error: error.message });
  }
};

// @desc    Like komentar
// @route   POST /api/forum/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);
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

// @desc    Dislike komentar
// @route   POST /api/forum/comments/:id/dislike
// @access  Private
const dislikeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);
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

// @desc    Get top categories forum
// @route   GET /api/forum/meta/top-categories
// @access  Public
const getTopCategories = async (req, res) => {
  try {
    const categories = await ForumTopic.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(categories.map(c => ({ name: c._id, count: c.count })));
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: error.message });
  }
};

// @desc    Get related topics
// @route   GET /api/forum/:id/related
// @access  Public
const getRelatedTopics = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topik tidak ditemukan' });

    const related = await ForumTopic.find({
      _id: { $ne: topic._id },
      category: topic.category,
      status: 'approved'
    })
    .limit(5)
    .select('title createdAt');

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik terkait', error: error.message });
  }
};

module.exports = { 
  getTopics, getTopicById, getTopicForEdit, createTopic, updateTopic, deleteTopic, 
  addComment, deleteComment, getMyTopics,
  likeComment, dislikeComment, getTopCategories, getRelatedTopics
};
