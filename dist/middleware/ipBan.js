const BannedIP = require('../models/BannedIP');

/**
 * Middleware to check if the requester's IP address is banned.
 */
const checkIPBan = async (req, res, next) => {
  try {
    const requesterIP = req.ip || req.connection.remoteAddress;
    
    const isBanned = await BannedIP.findOne({ 
      ip: requesterIP,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (isBanned) {
      return res.status(403).json({ 
        message: `Akses ditolak. IP Anda (${requesterIP}) telah diblokir.`,
        reason: isBanned.reason 
      });
    }

    next();
  } catch (error) {
    console.error('IP Ban Middleware Error:', error);
    next(); // Continue even if DB check fails to avoid total lockout
  }
};

module.exports = checkIPBan;
