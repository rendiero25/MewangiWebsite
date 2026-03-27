const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getReviews, getReviewById, createReview, updateReview, deleteReview,
  addReviewComment, getMyReviews,
} = require('../controllers/reviewController');

// Public
router.get('/', getReviews);
router.get('/:id', getReviewById);

// Private
router.get('/my/list', protect, getMyReviews);
router.post('/', protect, verified, upload.single('image'), createReview);
router.put('/:id', protect, verified, upload.single('image'), updateReview);
router.delete('/:id', protect, deleteReview);

// Comments
router.post('/:id/comments', protect, verified, addReviewComment);

module.exports = router;
