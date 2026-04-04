const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPendingReviews, getOnlineReviews, updateReviewStatus,
  getPendingArticles, getOnlineArticles, updateArticleStatus,
  getPendingTopics, getOnlineTopics, updateTopicStatus,
  getUsers, updateUserRole, deleteUser,
  banUser, unbanUser, issueWarning,
  banIP, getAuditLogs,
  createCategory, updateCategory, deleteCategory,
  getSettings, updateSettings,
  adminUpdateUser,
  createPerfume, updatePerfume, deletePerfume,
  getDashboardStats,
} = require('../controllers/adminController');

// All routes require admin access
router.use(protect, admin);

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// Global Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Review approval
router.get('/reviews/pending', getPendingReviews);
router.get('/reviews/online', getOnlineReviews);
router.put('/reviews/:id/status', updateReviewStatus);

// Article approval
router.get('/articles/pending', getPendingArticles);
router.get('/articles/online', getOnlineArticles);
router.put('/articles/:id/status', updateArticleStatus);

// Topic approval
router.get('/topics/pending', getPendingTopics);
router.get('/topics/online', getOnlineTopics);
router.put('/topics/:id/status', updateTopicStatus);

// User management
router.get('/users', getUsers);
router.put('/users/:id', adminUpdateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.post('/users/:id/warn', issueWarning);

// Category management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Security & Moderation
router.post('/ip-ban', banIP);

// Perfume management
router.post('/perfumes', upload.single('image'), createPerfume);
router.put('/perfumes/:id', upload.single('image'), updatePerfume);
router.delete('/perfumes/:id', deletePerfume);

module.exports = router;
