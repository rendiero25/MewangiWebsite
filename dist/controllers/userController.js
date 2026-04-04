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

    if (req.body.socialLinks) {
      try {
        const socialLinksData = typeof req.body.socialLinks === 'string' 
          ? JSON.parse(req.body.socialLinks) 
          : req.body.socialLinks;
        
        user.socialLinks = {
          ...user.socialLinks,
          ...socialLinksData
        };
      } catch (e) {
        console.error('Gagal parse socialLinks:', e);
      }
    }

    if (req.file) {
      // Hapus avatar lama jika ada dan bukan default
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', 'public', user.avatar.replace(/^\//, ''));
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
      socialLinks: user.socialLinks,
      statistik: user.statistik,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
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

// @desc    Get user profile by username or ID
// @route   GET /api/users/profile/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cari berdasar ID atau Username
    let query = { _id: id };
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { username: id };
    }

    const user = await User.findOne(query)
      .select('-verificationToken -verificationTokenExpire -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Convert to object to add dynamic fields
    const userObj = user.toObject();
    
    // Check if current user is following this profile
    userObj.isFollowing = false;
    if (req.user && user.followers) {
      userObj.isFollowing = user.followers.some(f => f._id.toString() === req.user._id.toString());
    }

    // Counts
    userObj.followerCount = user.followers ? user.followers.length : 0;
    userObj.followingCount = user.following ? user.following.length : 0;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Tidak bisa mengikuti diri sendiri' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Check if already following
    if (targetUser.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Sudah mengikuti user ini' });
    }

    // Add to followers
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    // Add to following
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Create Notification
    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'system', // or add 'follow' type
      message: `${currentUser.username} mulai mengikuti Anda`,
      link: `/profile/${currentUser.username}`
    });

    // Socket notification
    try {
      const socket = require('../socket');
      socket.getIO().to(targetUserId.toString()).emit('new_notification', notification);
    } catch (err) {
       console.error('[Socket] Failed to emit follow notification:', err.message);
    }

    res.json({ message: 'Berhasil mengikuti user', followerCount: targetUser.followers.length });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengikuti user', error: error.message });
  }
};

// @desc    Unfollow user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Remove from followers
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
    await targetUser.save();

    // Remove from following
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    await currentUser.save();

    res.json({ message: 'Berhasil berhenti mengikuti user', followerCount: targetUser.followers.length });
  } catch (error) {
    res.status(500).json({ message: 'Gagal berhenti mengikuti user', error: error.message });
  }
};

module.exports = { updateProfile, getTopMembers, getUserProfile, followUser, unfollowUser };
