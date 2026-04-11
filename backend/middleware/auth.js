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

      // Cek apakah user diblokir
      if (req.user.isBanned) {
        // Cek jika pemblokiran sudah berakhir
        if (req.user.banExpires && new Date() > req.user.banExpires) {
          req.user.isBanned = false;
          req.user.banReason = '';
          req.user.banExpires = null;
          await req.user.save();
        } else {
          return res.status(403).json({ 
            message: `Akun Anda sedang diblokir. Alasan: ${req.user.banReason}`,
            banExpires: req.user.banExpires 
          });
        }
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
  if (req.user && (req.user.isVerified || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Akun belum diverifikasi. Cek email Anda.' });
  }
};

// Middleware: Opsional - tidak wajib login, tapi ambil data user jika ada token
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      next(); // Lanjut saja jika token salah
    }
  } else {
    next();
  }
};

module.exports = { protect, admin, verified, optionalProtect };
