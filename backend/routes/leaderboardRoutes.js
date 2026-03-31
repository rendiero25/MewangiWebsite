const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getUserRank,
  getTopPerformers,
  getUserAchievements,
} = require('../controllers/leaderboardController');

/**
 * Leaderboard Routes
 */

// GET /api/leaderboard?type=reputation&period=alltime&limit=50
// Get leaderboard by type (reputation, posts, followers, helpful, active)
router.get('/', getLeaderboard);

// GET /api/leaderboard/top-performers?period=monthly&limit=10
// Get top performers in a specific period
router.get('/top-performers', getTopPerformers);

// GET /api/leaderboard/:userId/rank?type=reputation
// Get specific user's rank in leaderboard
router.get('/:userId/rank', getUserRank);

// GET /api/leaderboard/:userId/achievements
// Get user's achievements and badges
router.get('/:userId/achievements', getUserAchievements);

module.exports = router;
