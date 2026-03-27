const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPendingReviews, updateReviewStatus,
  getPendingArticles, updateArticleStatus,
  getUsers, updateUserRole, deleteUser,
  createPerfume, updatePerfume, deletePerfume,
  getDashboardStats,
} = require('../controllers/adminController');

// All routes require admin access
router.use(protect, admin);

// Dashboard
router.get('/stats', getDashboardStats);

// Review approval
router.get('/reviews/pending', getPendingReviews);
router.put('/reviews/:id/status', updateReviewStatus);

// Article approval
router.get('/articles/pending', getPendingArticles);
router.put('/articles/:id/status', updateArticleStatus);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Perfume management
router.post('/perfumes', upload.single('image'), createPerfume);
router.put('/perfumes/:id', upload.single('image'), updatePerfume);
router.delete('/perfumes/:id', deletePerfume);

module.exports = router;
