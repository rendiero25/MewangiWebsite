const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Proteksi route - harus login
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User tidak ditemukan' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }
};

// Middleware: Hanya admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses khusus admin' });
  }
};

// Middleware: Hanya member yang sudah verifikasi
const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    return res.status(403).json({ message: 'Akun belum diverifikasi. Cek email Anda.' });
  }
};

module.exports = { protect, admin, verified };
