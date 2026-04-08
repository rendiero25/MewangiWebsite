const express = require('express');
const router = express.Router();
const { protect, verified } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  getReviews, getReviewById, createReview, updateReview, deleteReview, 
  addReviewComment, getMyReviews, deleteReviewComment,
  likeComment, dislikeComment, getTopCategories, getRelatedReviews,
  likeReview, dislikeReview, getTopReviews
} = require('../controllers/reviewController');

// Public
router.get('/', getReviews);
router.get('/meta/top-categories', getTopCategories);
router.get('/meta/top-titles', getTopReviews);
router.get('/:id', getReviewById);
router.get('/:id/related', getRelatedReviews);

// Reactions
router.post('/:id/like', protect, likeReview);
router.post('/:id/dislike', protect, dislikeReview);

// Protected
router.post('/', protect, verified, upload.single('image'), upload.cloudinaryUpload('reviews'), createReview);
router.get('/my/list', protect, getMyReviews);
router.put('/:id', protect, verified, upload.single('image'), upload.cloudinaryUpload('reviews'), updateReview);
router.delete('/:id', protect, deleteReview);

// Comments
router.post(
  '/:id/comments',
  protect,
  verified,
  upload.single('image'),
  upload.cloudinaryUpload('review-comments'),
  addReviewComment
);
router.post('/comments/:id/like', protect, likeComment);
router.post('/comments/:id/dislike', protect, dislikeComment);
router.delete('/comments/:commentId', protect, deleteReviewComment);

module.exports = router;
