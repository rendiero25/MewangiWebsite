const User = require('../models/User');
const Review = require('../models/Review');
const Article = require('../models/Article');
const ForumTopic = require('../models/ForumTopic');
const Perfume = require('../models/Perfume');

/**
 * @desc    Get public site statistics
 * @route   GET /api/stats
 * @access  Public
 */
const getPublicStats = async (req, res) => {
  console.log('Public Stats requested');
  try {
    const [
      totalUsers,
      totalReviews,
      totalTopics,
      totalArticles,
      totalPerfumes,
    ] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments({ status: 'approved' }),
      ForumTopic.countDocuments({ status: 'approved' }),
      Article.countDocuments({ status: 'approved' }),
      Perfume.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalReviews,
      totalTopics,
      totalArticles,
      totalPerfumes,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal mengambil statistik publik', 
      error: error.message 
    });
  }
};

module.exports = {
  getPublicStats,
};
