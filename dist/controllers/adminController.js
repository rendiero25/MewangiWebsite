const User = require('../models/User');
const Review = require('../models/Review');
const Article = require('../models/Article');
const Perfume = require('../models/Perfume');
const ForumTopic = require('../models/ForumTopic');
const ForumComment = require('../models/ForumComment');
const ArticleComment = require('../models/ArticleComment');
const ReviewComment = require('../models/ReviewComment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Warning = require('../models/Warning');
const BannedIP = require('../models/BannedIP');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const { getUploadedUrl } = require('../utils/uploadedMediaUrl');

// ==================== APPROVAL ====================

// @desc    Get pending reviews
// @route   GET /api/admin/reviews/pending
// @access  Private (admin only)
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: { $in: ['pending', 'rejected'] } })
      .populate('author', 'username email avatar')
      .sort({ createdAt: 1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil review', error: error.message });
  }
};

// @desc    Get online (approved) reviews
// @route   GET /api/admin/reviews/online
// @access  Private (admin only)
const getOnlineReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('author', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(100);
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
    if (status === 'approved') review.hasBeenApproved = true;
    if (status === 'rejected' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }
    await review.save();

    // Notify user
    const notification = await Notification.create({
      recipient: review.author,
      sender: req.user._id,
      type: status === 'approved' ? 'approve_review' : 'reject_review',
      message: status === 'approved' 
        ? `Review Anda "${review.title}" telah disetujui!` 
        : `Review Anda "${review.title}" ditolak. Alasan: ${rejectionReason || 'Tidak ada alasan spesifik'}`,
      link: `/review/${review._id}`
    });

    const socket = require('../socket');
    socket.getIO().to(review.author.toString()).emit('new_notification', notification);

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
    const articles = await Article.find({ status: { $in: ['pending', 'rejected'] } })
      .populate('author', 'username email avatar')
      .sort({ createdAt: 1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil artikel', error: error.message });
  }
};

// @desc    Get online (approved) articles
// @route   GET /api/admin/articles/online
// @access  Private (admin only)
const getOnlineArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved' })
      .populate('author', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(100);
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
    if (status === 'approved') article.hasBeenApproved = true;
    if (status === 'rejected' && rejectionReason) {
      article.rejectionReason = rejectionReason;
    }
    await article.save();

    // Notify user
    const notification = await Notification.create({
      recipient: article.author,
      sender: req.user._id,
      type: status === 'approved' ? 'approve_article' : 'reject_article',
      message: status === 'approved' 
        ? `Artikel Anda "${article.title}" telah disetujui!` 
        : `Artikel Anda "${article.title}" ditolak. Alasan: ${rejectionReason || 'Tidak ada alasan spesifik'}`,
      link: `/blog/${article.slug}`
    });

    const socket = require('../socket');
    socket.getIO().to(article.author.toString()).emit('new_notification', notification);

    res.json({ message: `Artikel berhasil di-${status}`, article });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status artikel', error: error.message });
  }
};

// @desc    Get pending topics
// @route   GET /api/admin/topics/pending
// @access  Private (admin only)
const getPendingTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find({ status: { $in: ['pending', 'rejected'] } })
      .populate('author', 'username email avatar')
      .populate('category', 'name')
      .sort({ createdAt: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik', error: error.message });
  }
};

// @desc    Get online (approved) topics
// @route   GET /api/admin/topics/online
// @access  Private (admin only)
const getOnlineTopics = async (req, res) => {
  try {
    const topics = await ForumTopic.find({ status: 'approved' })
      .populate('author', 'username email avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil topik', error: error.message });
  }
};

// @desc    Approve/Reject topic
// @route   PUT /api/admin/topics/:id/status
// @access  Private (admin only)
const updateTopicStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status harus approved atau rejected' });
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topik tidak ditemukan' });
    topic.status = status;
    if (status === 'approved') topic.hasBeenApproved = true;
    if (status === 'rejected' && rejectionReason) topic.rejectionReason = rejectionReason;
    await topic.save();

    // Notify user
    const notification = await Notification.create({
      recipient: topic.author,
      sender: req.user._id,
      type: status === 'approved' ? 'approve_forum' : 'reject_forum', // Assuming these exist or will be added
      message: status === 'approved' 
        ? `Topik Forum Anda "${topic.title}" telah disetujui!` 
        : `Topik Forum Anda "${topic.title}" ditolak. Alasan: ${rejectionReason || 'Tidak ada alasan spesifik'}`,
      link: `/forum/${topic._id}`
    });

    const socket = require('../socket');
    socket.getIO().to(topic.author.toString()).emit('new_notification', notification);

    res.json({ message: `Topik berhasil di-${status}`, topic });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status topik', error: error.message });
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

// @desc    Admin update user profile
// @route   PUT /api/admin/users/:id
// @access  Private (admin only)
const adminUpdateUser = async (req, res) => {
  try {
    const { username, email, bio, gender, location, website } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.gender = gender || user.gender;
    user.location = location || user.location;
    user.website = website || user.website;

    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'ADMIN_UPDATE_USER',
      targetType: 'User',
      targetId: user._id,
      details: 'Admin mengupdate profil user',
      ipAddress: req.ip
    });

    res.json({ message: 'Profil user berhasil diupdate', user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate user', error: error.message });
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

// @desc    Ban/Suspend user
// @route   POST /api/admin/users/:id/ban
// @access  Private (admin only)
const banUser = async (req, res) => {
  try {
    const { reason, duration } = req.body; // duration in days, 0 for permanent
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Tidak bisa memblokir admin' });
    }

    user.isBanned = true;
    user.banReason = reason || 'Pelanggaran aturan komunitas';
    
    if (duration > 0) {
      user.banExpires = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    } else {
      user.banExpires = null; // Permanent
    }

    await user.save();
    
    // Log moderation action
    await AuditLog.create({
      admin: req.user._id,
      action: 'BAN_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Alasan: ${user.banReason}. Durasi: ${duration > 0 ? duration + ' hari' : 'Permanen'}`,
      ipAddress: req.ip
    });

    // Notify user via notification
    await Notification.create({
      recipient: user._id,
      type: 'system',
      message: `Akun Anda telah diblokir. Alasan: ${user.banReason}. ${duration > 0 ? `Berakhir pada ${user.banExpires.toLocaleDateString('id-ID')}` : 'Pemblokiran permanen.'}`,
      link: '#'
    });

    res.json({ message: 'User berhasil diblokir', user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memblokir user', error: error.message });
  }
};

// @desc    Unban user
// @route   POST /api/admin/users/:id/unban
// @access  Private (admin only)
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    user.isBanned = false;
    user.banReason = '';
    user.banExpires = null;

    await user.save();
    
    await AuditLog.create({
      admin: req.user._id,
      action: 'UNBAN_USER',
      targetType: 'User',
      targetId: user._id,
      details: 'Blokir dibuka oleh admin',
      ipAddress: req.ip
    });

    res.json({ message: 'Blokir user berhasil dibuka', user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuka blokir user', error: error.message });
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
      image: req.file ? getUploadedUrl(req) : '',
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
    if (req.file) perfume.image = getUploadedUrl(req);

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
    const [
      totalUsers,
      totalPerfumes,
      pendingReviews,
      pendingArticles,
      pendingTopics,
      approvedTopics,
      approvedReviews,
      approvedArticles,
      forumComments,
      articleComments,
      reviewComments,
      totalReports,
    ] = await Promise.all([
      User.countDocuments(),
      Perfume.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Article.countDocuments({ status: 'pending' }),
      ForumTopic.countDocuments({ status: 'pending' }),
      ForumTopic.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'approved' }),
      Article.countDocuments({ status: 'approved' }),
      ForumComment.countDocuments(),
      ArticleComment.countDocuments(),
      ReviewComment.countDocuments(),
      Report.countDocuments(),
    ]);

    // Active Today (users active in the last 24h)
    const activeToday = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });

    const totalComments = forumComments + articleComments + reviewComments;

    res.json({
      totalUsers,
      totalPerfumes,
      pendingReviews,
      pendingArticles,
      pendingTopics,
      approvedReviews,
      approvedArticles,
      totalTopics: approvedTopics,
      totalComments,
      forumComments,
      articleComments,
      reviewComments,
      totalPosts: approvedTopics + totalComments,
      activeToday,
      totalReports,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, order, parentCategory, needsApproval, visibility, metaTitle, metaDescription } = req.body;
    const category = await Category.create({ name, description, icon, order, parentCategory, needsApproval, visibility, metaTitle, metaDescription });
    
    await AuditLog.create({
      admin: req.user._id,
      action: 'CREATE_CATEGORY',
      targetType: 'Category',
      targetId: category._id,
      details: `Nama: ${name}`,
      ipAddress: req.ip
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat kategori', error: error.message });
  }
};

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
// @access  Private (admin only)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Kategori tidak ditemukan' });

    await AuditLog.create({
      admin: req.user._id,
      action: 'UPDATE_CATEGORY',
      targetType: 'Category',
      targetId: category._id,
      details: `Kategori: ${category.name}`,
      ipAddress: req.ip
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate kategori', error: error.message });
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (admin only)
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Find "General" category or create it if it doesn't exist
    let general = await Category.findOne({ name: /General/i });
    if (!general) {
      general = await Category.create({ name: 'General', slug: 'general', description: 'Kategori umum' });
    }

    if (general._id.toString() === categoryId) {
      return res.status(400).json({ message: 'Tidak bisa menghapus kategori utama (General)' });
    }

    // Move all topics to general
    await ForumTopic.updateMany({ category: categoryId }, { category: general._id });

    const category = await Category.findByIdAndDelete(categoryId);
    
    await AuditLog.create({
      admin: req.user._id,
      action: 'DELETE_CATEGORY',
      targetType: 'Category',
      targetId: categoryId,
      details: 'Kategori dihapus, topik dipindah ke General',
      ipAddress: req.ip
    });

    res.json({ message: 'Kategori berhasil dihapus, konten dipindahkan ke General' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus kategori', error: error.message });
  }
};

// ==================== GLOBAL SETTINGS ====================

// @desc    Get Global Settings
// @route   GET /api/admin/settings
// @access  Private (admin only)
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil pengaturan', error: error.message });
  }
};

// @desc    Get Public Settings (Subset)
// @route   GET /api/settings
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().select('forumName forumDescription logo aboutMissionImage');
    if (!settings) {
      return res.json({
        forumName: 'Mewangi Forum',
        forumDescription: 'Komunitas pecinta parfum Indonesia',
        logo: '',
        aboutMissionImage: ''
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil pengaturan publik', error: error.message });
  }
};

// @desc    Update Global Settings
// @route   PUT /api/admin/settings
// @access  Private (admin only)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const updateData = { ...req.body };

    if (req.file) {
      updateData.aboutMissionImage = getUploadedUrl(req);
    }

    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'UPDATE_SETTINGS',
      targetType: 'Settings',
      targetId: settings._id,
      details: 'Pengaturan global diperbarui',
      ipAddress: req.ip
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate pengaturan', error: error.message });
  }
};

// ==================== MODERATION & SECURITY ====================

// @desc    Give warning to user
// @route   POST /api/admin/users/:id/warn
// @access  Private (admin only)
const issueWarning = async (req, res) => {
  try {
    const { reason, points = 1 } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    const warning = await Warning.create({
      user: user._id,
      moderator: req.user._id,
      reason,
      points,
      expireAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days default
    });

    // Update user reputation (decrement)
    user.statistik.reputation -= (points * 10);
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'ISSUE_WARNING',
      targetType: 'User',
      targetId: user._id,
      details: `Poin: ${points}, Alasan: ${reason}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Peringatan berhasil dikirim', warning });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim peringatan', error: error.message });
  }
};

// @desc    Ban IP address
// @route   POST /api/admin/ip-ban
// @access  Private (admin only)
const banIP = async (req, res) => {
  try {
    const { ip, reason, duration } = req.body;
    const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    const bannedIP = await BannedIP.create({
      ip,
      reason,
      bannedBy: req.user._id,
      expiresAt
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'BAN_IP',
      targetType: 'Settings',
      targetId: bannedIP._id,
      details: `IP: ${ip}, Alasan: ${reason}`,
      ipAddress: req.ip
    });

    res.status(201).json({ message: 'IP berhasil diblokir', bannedIP });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memblokir IP', error: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (admin only)
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('admin', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AuditLog.countDocuments();
    res.json({ logs, total, currentPage: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil log audit', error: error.message });
  }
};

module.exports = {
  getPendingReviews, getOnlineReviews, updateReviewStatus,
  getPendingArticles, getOnlineArticles, updateArticleStatus,
  getPendingTopics, getOnlineTopics, updateTopicStatus,
  getUsers, updateUserRole, deleteUser,
  banUser, unbanUser, issueWarning,
  banIP, getAuditLogs,
  createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings, getPublicSettings,
  adminUpdateUser,
  createPerfume, updatePerfume, deletePerfume,
  getDashboardStats,
};
