const User = require('../models/User');
const ForumComment = require('../models/ForumComment');
const ArticleComment = require('../models/ArticleComment');
const ReviewComment = require('../models/ReviewComment');
const path = require('path');
const fs = require('fs');

// @desc    Update profil user
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const { username, bio, gender, birthday, location, website } = req.body;

    // Cek username unik jika berubah
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
      user.username = username;
    }

    user.bio = bio !== undefined ? bio : user.bio;
    user.gender = gender !== undefined ? gender : user.gender;
    user.birthday = birthday !== undefined ? birthday : user.birthday;
    user.location = location !== undefined ? location : user.location;
    user.website = website !== undefined ? website : user.website;

    if (req.file) {
      // Hapus avatar lama jika ada dan bukan default
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      gender: user.gender,
      birthday: user.birthday,
      location: user.location,
      website: user.website,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update profil', error: error.message });
  }
};

// @desc    Get top members (berdasarkan jumlah komentar di forum, artikel, review)
// @route   GET /api/users/top-members
// @access  Public
const getTopMembers = async (req, res) => {
  try {
    // Aggregation to count comments for each user across all 3 comment collections
    const topForum = await ForumComment.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);
    const topArticle = await ArticleComment.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);
    const topReview = await ReviewComment.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);

    // Merge counts
    const counts = {};
    [...topForum, ...topArticle, ...topReview].forEach(item => {
      const id = item._id.toString();
      counts[id] = (counts[id] || 0) + item.count;
    });

    // Sort and take top 5
    const topIds = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5);

    const users = await User.find({ _id: { $in: topIds } })
      .select('username avatar');

    // Add count back to user objects
    const result = users.map(u => ({
      ...u.toObject(),
      commentCount: counts[u._id.toString()]
    })).sort((a, b) => b.commentCount - a.commentCount);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil top members', error: error.message });
  }
};

module.exports = { updateProfile, getTopMembers };
