const User = require('../models/User');
const ForumTopic = require('../models/ForumTopic');
const ForumComment = require('../models/ForumComment');

/**
 * Get leaderboard data based on different metrics
 * Support for: reputation, posts, helpful, followers
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'reputation', period = 'alltime', limit = 50 } = req.query;

    let query = { role: { $ne: 'banned' } };
    let sortBy = {};

    switch (type) {
      case 'reputation':
        // Reputation/Karma score
        sortBy = { reputation: -1 };
        break;

      case 'posts':
        // Most active posters
        sortBy = { 'statistics.topicsCount': -1 };
        break;

      case 'followers':
        // Most followers
        sortBy = { 'statistics.followersCount': -1 };
        break;

      case 'helpful':
        // Most helpful posts (based on likes)
        sortBy = { 'statistics.totalLikes': -1 };
        break;

      case 'active':
        // Most active in period
        if (period === 'monthly') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          query.lastActive = { $gte: oneMonthAgo };
        } else if (period === 'weekly') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          query.lastActive = { $gte: oneWeekAgo };
        }
        sortBy = { lastActive: -1 };
        break;

      default:
        sortBy = { reputation: -1 };
    }

    const leaderboard = await User.find(query)
      .select(
        'username avatar bio reputation statistics role joinDate lastActive'
      )
      .sort(sortBy)
      .limit(Number(limit))
      .lean();

    // Calculate rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      type,
      period,
      count: rankedLeaderboard.length,
      data: rankedLeaderboard,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

/**
 * Get user's rank in specific leaderboard type
 */
exports.getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'reputation' } = req.query;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    let sortBy = {};
    let value = 0;

    switch (type) {
      case 'reputation':
        sortBy = { reputation: -1 };
        value = user.reputation || 0;
        break;
      case 'posts':
        sortBy = { 'statistics.topicsCount': -1 };
        value = user.statistics?.topicsCount || 0;
        break;
      case 'followers':
        sortBy = { 'statistics.followersCount': -1 };
        value = user.statistics?.followersCount || 0;
        break;
      case 'helpful':
        sortBy = { 'statistics.totalLikes': -1 };
        value = user.statistics?.totalLikes || 0;
        break;
      default:
        sortBy = { reputation: -1 };
        value = user.reputation || 0;
    }

    // Count how many users rank higher
    const usersAbove = await User.countDocuments({
      [Object.keys(sortBy)[0]]: { $gt: value },
    });

    res.status(200).json({
      success: true,
      userId,
      type,
      rank: usersAbove + 1,
      value,
      username: user.username,
    });
  } catch (error) {
    console.error('Error getting user rank:', error);
    res.status(500).json({
      message: 'Error fetching user rank',
      error: error.message,
    });
  }
};

/**
 * Get top performers by period
 */
exports.getTopPerformers = async (req, res) => {
  try {
    const { period = 'monthly', limit = 10 } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (period === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    } else if (period === 'yearly') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneYearAgo } };
    }

    // Get users with most posts in period
    const topPosters = await ForumTopic.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$author', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          avatar: '$user.avatar',
          postCount: 1,
          reputation: '$user.reputation',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      period,
      data: topPosters.map((poster, index) => ({
        ...poster,
        rank: index + 1,
      })),
    });
  } catch (error) {
    console.error('Error getting top performers:', error);
    res.status(500).json({
      message: 'Error fetching top performers',
      error: error.message,
    });
  }
};

/**
 * Get badges/achievements for a user
 */
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const achievements = [];

    // Achievement criteria
    if (user.statistics?.topicsCount >= 1) {
      achievements.push({
        name: '🏁 First Post',
        description: 'Membuat topik pertama',
        unlockedAt: user.createdAt,
      });
    }

    if (user.statistics?.topicsCount >= 10) {
      achievements.push({
        name: '💬 10 Posts',
        description: 'Membuat 10 topik',
      });
    }

    if (user.statistics?.topicsCount >= 50) {
      achievements.push({
        name: '🌟 50 Posts',
        description: 'Membuat 50 topik',
      });
    }

    if (user.reputation >= 100) {
      achievements.push({
        name: '⭐ Trusted Member',
        description: 'Mencapai reputasi 100',
      });
    }

    if (user.reputation >= 500) {
      achievements.push({
        name: '👑 Forum VIP',
        description: 'Mencapai reputasi 500',
      });
    }

    if (user.statistics?.followersCount >= 10) {
      achievements.push({
        name: '👥 Popular',
        description: 'Memiliki 10 pengikut',
      });
    }

    if (user.role === 'moderator') {
      achievements.push({
        name: '🛡️ Moderator',
        description: 'Dipromosikan sebagai moderator',
      });
    }

    if (user.role === 'admin') {
      achievements.push({
        name: '👨‍💼 Administrator',
        description: 'Tim Administrator Forum',
      });
    }

    res.status(200).json({
      success: true,
      userId,
      achievements: achievements.map((ach, index) => ({
        ...ach,
        id: index + 1,
      })),
      totalAchievements: achievements.length,
    });
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({
      message: 'Error fetching achievements',
      error: error.message,
    });
  }
};
