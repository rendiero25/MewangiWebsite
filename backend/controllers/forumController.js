const mongoose = require("mongoose");
const ForumTopic = require("../models/ForumTopic");
const ForumComment = require("../models/ForumComment");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { filterBadWords } = require("../utils/moderation");
const { getUploadedUrl } = require("../utils/uploadedMediaUrl");

// @desc    Get semua topik forum
// @route   GET /api/forum
// @access  Public
const getTopics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      category,
      search,
      tag,
      prefix,
      type,
      sort = "latest",
      startDate,
      endDate,
      userId,
    } = req.query;

    const query = { $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] };

    // Filter Kategori
    if (category && category !== "Semua") {
      const cat = await Category.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(category) ? category : null },
          { slug: category },
        ],
      });
      if (cat) query.category = cat._id;
    }

    // Full-text search
    if (search) query.$text = { $search: search };

    // Advanced search filters
    if (tag) query.tags = tag;
    if (prefix) query.prefix = prefix;
    if (type) query.type = type;
    if (userId) query.author = userId;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Sorting logic
    let sortObj = {};
    if (sort === "popular") {
      sortObj = { views: -1, createdAt: -1 };
    } else if (sort === "replies") {
      sortObj = { replyCount: -1, createdAt: -1 };
    } else if (sort === "relevance" && search) {
      sortObj = { score: { $meta: "textScore" } };
    } else {
      // Latest/Default: Pinned & Announcement first, then latest
      sortObj = { isPinned: -1, isAnnouncement: -1, lastReplyAt: -1 };
    }

    const topics = await ForumTopic.find(
      query,
      sort === "relevance" ? { score: { $meta: "textScore" } } : {},
    )
      .populate("author", "username avatar")
      .populate("category", "name slug icon")
      .sort(sortObj)
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
    res
      .status(500)
      .json({ message: "Gagal mengambil topik", error: error.message });
  }
};

// @desc    Get topik by ID + komentar
// @route   GET /api/forum/:id
// @access  Public
const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

    const topic = await ForumTopic.findOneAndUpdate(
      { ...query, $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] },
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("author", "username avatar")
      .populate("category", "name slug");

    if (!topic) {
      return res.status(404).json({ message: "Topik tidak ditemukan" });
    }

    const comments = await ForumComment.find({ topic: topic._id })
      .populate("author", "username avatar")
      .populate("quote", "content author")
      .sort({ createdAt: 1 });

    res.json({ topic, comments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil topik", error: error.message });
  }
};

// @desc    Get topik by ID (untuk admin/author edit via dashboard)
// @route   GET /api/forum/edit/:id
// @access  Private
const getTopicForEdit = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic)
      return res.status(404).json({ message: "Topik tidak ditemukan" });

    if (
      topic.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak memiliki izin" });
    }

    res.json(topic);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil topik", error: error.message });
  }
};

// @desc    Buat topik baru
// @route   POST /api/forum
// @access  Private (verified member)
const createTopic = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags,
      prefix,
      type,
      status: requestStatus,
      isAnnouncement,
      isFeatured,
    } = req.body;

    // Spam Protection: 1 topic per minute
    const lastTopic = await ForumTopic.findOne({ author: req.user._id }).sort({ createdAt: -1 });
    if (lastTopic && (Date.now() - new Date(lastTopic.createdAt).getTime()) < 60000) {
      return res.status(429).json({ message: 'Anda mengirim topik terlalu cepat. Tunggu sebentar.' });
    }

    // Determine status: draft if requested, otherwise pending (same for admin and member)
    let status;
    if (requestStatus === 'draft') {
      status = 'draft';
    } else {
      status = 'pending';
    }

    const topic = await ForumTopic.create({
      title: filterBadWords(title),
      content: filterBadWords(content),
      category,
      tags: tags || [],
      prefix: prefix || "",
      type: type || "normal",
      isAnnouncement: (req.user.role === 'admin' && isAnnouncement) || false,
      isFeatured: (req.user.role === 'admin' && isFeatured) || false,
      author: req.user._id,
      image: req.file ? getUploadedUrl(req) : "",
      status,
    });

    await topic.populate("author", "username avatar");

    // Notify admins only if status is pending AND the author is not an admin themselves
    if (status === 'pending' && req.user.role !== 'admin') {
      try {
        const admins = await User.find({ role: "admin" });
        const socket = require('../socket');
        
        await Promise.all(
          admins.map(async (admin) => {
            const notification = await Notification.create({
              recipient: admin._id,
              sender: req.user._id,
              type: "system",
              message: `Topik baru pending: "${topic.title}" oleh ${req.user.username || 'Member'}`,
              link: `/admin`,
            });
            // Real-time socket notification
            socket.getIO().to(admin._id.toString()).emit('new_notification', notification);
          }),
        );
      } catch (notifyErr) {
        console.error("Notification Error (Topic):", notifyErr);
        // Don't crash the main process if notification fails
      }
    }

    res.status(201).json(topic);
  } catch (error) {
    console.error("Create Topic Error:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat topik", error: error.message });
  }
};

// @desc    Update topik
// @route   PUT /api/forum/:id
// @access  Private (author only)
const updateTopic = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topik tidak ditemukan" });
    }

    if (
      topic.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak memiliki izin" });
    }

    const {
      title,
      content,
      category,
      tags,
      prefix,
      isPinned,
      isClosed,
      isAnnouncement,
      isFeatured,
    } = req.body;
    topic.title = title ? filterBadWords(title) : topic.title;
    topic.content = content ? filterBadWords(content) : topic.content;
    topic.category = category || topic.category;
    topic.tags = tags || topic.tags;
    topic.prefix = prefix || topic.prefix;
    if (req.file) topic.image = getUploadedUrl(req);

    if (req.user.role === "admin") {
      topic.isPinned = isPinned !== undefined ? isPinned : topic.isPinned;
      topic.isClosed = isClosed !== undefined ? isClosed : topic.isClosed;
      topic.isAnnouncement =
        isAnnouncement !== undefined ? isAnnouncement : topic.isAnnouncement;
      topic.isFeatured =
        isFeatured !== undefined ? isFeatured : topic.isFeatured;
    }
    topic.status = req.body.status || "pending";
    topic.rejectionReason = "";

    await topic.save();
    await topic.populate("author", "username avatar");

    // Notify admins if not draft
    if (topic.status === "pending") {
      try {
        const admins = await User.find({ role: "admin" });
        const socket = require('../socket');
        await Promise.all(admins.map(async (admin) => {
          const notification = await Notification.create({
            recipient: admin._id,
            sender: req.user._id,
            type: "system",
            message: `Topik diedit (pending): "${topic.title}" oleh ${req.user.username || 'Member'}`,
            link: `/admin`
          });
          socket.getIO().to(admin._id.toString()).emit('new_notification', notification);
        }));
      } catch (notifyErr) {
        console.error('Notification Error (Update Topic):', notifyErr);
      }
    }

    res.json(topic);
  } catch (error) {
    console.error("Update Topic Error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengupdate topik", error: error.message });
  }
};

// @desc    Hapus topik
// @route   DELETE /api/forum/:id
// @access  Private (author / admin)
const deleteTopic = async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topik tidak ditemukan" });
    }

    if (
      topic.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak memiliki izin" });
    }

    // Hapus semua komentar di topik ini
    await ForumComment.deleteMany({ topic: topic._id });
    await ForumTopic.findByIdAndDelete(topic._id);

    res.json({ message: "Topik berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus topik", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const topic = await ForumTopic.findOne(query);

    if (!topic) {
      return res.status(404).json({ message: "Topik tidak ditemukan" });
    }

    if (topic.isClosed) {
      return res.status(403).json({ message: "Topik sudah ditutup" });
    }

    // Spam Protection: 1 comment per 30 seconds
    const lastComment = await ForumComment.findOne({ author: req.user._id, topic: topic._id }).sort({ createdAt: -1 });
    if (lastComment && (Date.now() - new Date(lastComment.createdAt).getTime()) < 30000) {
      return res.status(429).json({ message: 'Anda mengirim komentar terlalu cepat. Tunggu sebentar.' });
    }

    const comment = await ForumComment.create({
      content: filterBadWords(req.body.content),
      topic: topic._id,
      author: req.user._id,
      parentComment: req.body.parentComment || null,
      quote: req.body.quote || null,
      mentions: req.body.mentions || [],
      image: req.file ? getUploadedUrl(req) : null,
    });

    // Update reply count dan lastReplyAt
    topic.replyCount += 1;
    topic.lastReplyAt = Date.now();
    await topic.save();

    await comment.populate("author", "username avatar");

    // Notify topic author (if not the commenter)
    if (topic.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: topic.author,
        sender: req.user._id,
        type: "comment_forum",
        message: `${req.user.username} mengomentari topik Anda: "${topic.title}"`,
        link: `/forum/${topic.slug || topic._id}`,
      });

      const socket = require("../socket");
      socket
        .getIO()
        .to(topic.author.toString())
        .emit("new_notification", notification);
    }

    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menambah komentar", error: error.message });
  }
};

// @desc    Hapus komentar
// @route   DELETE /api/forum/comments/:commentId
// @access  Private (author / admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak memiliki izin" });
    }

    const topic = await ForumTopic.findById(comment.topic);
    if (topic) {
      topic.replyCount = Math.max(0, topic.replyCount - 1);
      await topic.save();
    }

    await ForumComment.findByIdAndDelete(req.params.commentId);

    res.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus komentar", error: error.message });
  }
};

// @desc    Get my topics (untuk member dashboard)
// @route   GET /api/forum/my/list
// @access  Private
const getMyTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find({ author: req.user._id })
      .select("-content")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil topik", error: error.message });
  }
};

// @desc    Like komentar
// @route   POST /api/forum/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Komentar tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(comment.author);

    let repChange = 0;
    let reactChange = 0;

    // Remove Dislike if exists
    if (comment.dislikes.includes(userId)) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    }

    // Toggle Like
    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    } else {
      comment.likes.push(userId);
      repChange += 1;
      reactChange += 1;
    }

    await comment.save();
    
    // Update Author Reputation
    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyukai komentar", error: error.message });
  }
};

// @desc    Dislike komentar
// @route   POST /api/forum/comments/:id/dislike
// @access  Private
const dislikeComment = async (req, res) => {
  try {
    const comment = await ForumComment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Komentar tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(comment.author);

    let repChange = 0;
    let reactChange = 0;

    // Remove Like if exists
    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    }

    // Toggle Dislike
    if (comment.dislikes.includes(userId)) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    } else {
      comment.dislikes.push(userId);
      repChange -= 1;
    }

    await comment.save();

    // Update Author Reputation
    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal tidak menyukai komentar", error: error.message });
  }
};

const getTopCategories = async (req, res) => {
  try {
    const categories = await ForumTopic.aggregate([
      { $match: { $or: [{ status: 'approved' }, { status: 'pending', hasBeenApproved: true }] } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      { $project: { name: "$categoryDetails.name", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil kategori", error: error.message });
  }
};

// @desc    Get related topics
// @route   GET /api/forum/:id/related
// @access  Public
const getRelatedTopics = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const topic = await ForumTopic.findOne(query);

    if (!topic)
      return res.status(404).json({ message: "Topik tidak ditemukan" });

    const related = await ForumTopic.aggregate([
      {
        $match: {
          _id: { $ne: topic._id },
          $or: [
            { status: "approved" },
            { status: "pending", hasBeenApproved: true },
          ],
        },
      },
      { $sample: { size: 4 } },
      { $project: { title: 1, createdAt: 1, slug: 1 } },
    ]);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil topik terkait", error: error.message });
  }
};

// @desc    Get top titles forum (trending)
// @route   GET /api/forum/meta/top-titles
// @access  Public
const getTopTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find({
      $or: [{ status: "approved" }, { status: "pending", hasBeenApproved: true }],
    })
      .sort({ views: -1 })
      .limit(5)
      .select("title slug views");

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil topik terpopuler", error: error.message });
  }
};

// @desc    Like topik
// @route   POST /api/forum/:id/like
// @access  Private
const likeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const topic = await ForumTopic.findOne(query);

    if (!topic) return res.status(404).json({ message: "Topik tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(topic.author);

    let repChange = 0;
    let reactChange = 0;

    if (topic.dislikes.includes(userId)) {
      topic.dislikes = topic.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    }

    if (topic.likes.includes(userId)) {
      topic.likes = topic.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    } else {
      topic.likes.push(userId);
      repChange += 1;
      reactChange += 1;
    }

    await topic.save();

    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: topic.likes, dislikes: topic.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyukai topik", error: error.message });
  }
};

// @desc    Dislike topik
// @route   POST /api/forum/:id/dislike
// @access  Private
const dislikeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const topic = await ForumTopic.findOne(query);

    if (!topic) return res.status(404).json({ message: "Topik tidak ditemukan" });

    const userId = req.user._id;
    const author = await User.findById(topic.author);

    let repChange = 0;
    let reactChange = 0;

    if (topic.likes.includes(userId)) {
      topic.likes = topic.likes.filter(id => id.toString() !== userId.toString());
      repChange -= 1;
      reactChange -= 1;
    }

    if (topic.dislikes.includes(userId)) {
      topic.dislikes = topic.dislikes.filter(id => id.toString() !== userId.toString());
      repChange += 1;
    } else {
      topic.dislikes.push(userId);
      repChange -= 1;
    }

    await topic.save();

    if (author) {
      author.statistik.reputation += repChange;
      author.statistik.reactions += reactChange;
      await author.save();
    }

    res.json({ likes: topic.likes, dislikes: topic.dislikes });
  } catch (error) {
    res.status(500).json({ message: "Gagal tidak menyukai topik", error: error.message });
  }
};

module.exports = {
  getTopics,
  getTopicById,
  getTopicForEdit,
  createTopic,
  updateTopic,
  deleteTopic,
  addComment,
  deleteComment,
  getMyTopics,
  likeTopic,
  dislikeTopic,
  likeComment,
  dislikeComment,
  getTopCategories,
  getRelatedTopics,
  getTopTopics,
};
