const express = require('express');
const router = express.Router();
const { updateProfile, getTopMembers, getUserProfile, followUser, unfollowUser } = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   PUT /api/users/profile
router.put(
  '/profile',
  protect,
  upload.single('avatar'),
  upload.cloudinaryUpload('avatars'),
  updateProfile
);

// @route   GET /api/users/profile/:id
router.get('/profile/:id', optionalProtect, getUserProfile);

// @route   GET /api/users/top-members
router.get('/top-members', getTopMembers);

// @route   POST /api/users/:id/follow
router.post('/:id/follow', protect, followUser);

// @route   POST /api/users/:id/unfollow
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;
