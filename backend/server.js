const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Unggah baru: Cloudinary jika CLOUDINARY_URL (atau cloud_name + key + secret) di .env.
// /uploads tetap dilayani untuk data lama yang masih menyimpan path relatif /uploads/...
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const connectDB = require('./config/db');
const { isOriginAllowed } = require('./config/corsOrigins');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const forumRoutes = require('./routes/forumRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const articleRoutes = require('./routes/articleRoutes');
const perfumeRoutes = require('./routes/perfumeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingRoutes = require('./routes/settingRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const checkIPBan = require('./middleware/ipBan');

// Connect to MongoDB
connectDB();

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 2000, // Higher limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' }
});

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware - CORS MUST come FIRST to handle preflight OPTIONS requests
// Origin: localhost (dev) + FRONTEND_URL + CORS_ORIGINS — lihat config/corsOrigins.js
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS] Rejected Origin: ${origin}`);
      callback(new Error(`CORS Error: Origin ${origin || 'unknown'} is not allowed. Check FRONTEND_URL/CORS_ORIGINS.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting - Applied AFTER CORS
app.use('/api/', apiLimiter);
app.use('/api/', checkIPBan);

app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/perfumes', perfumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingRoutes);

// SEO Routes (Sitemap & Robots)
app.use('/', sitemapRoutes);

// Static Folder for Frontend Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get(/^\/uploads\/.+/, (req, res) => {
    res.status(404).type('text/plain').send('Not found');
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Mewangi Website API is running...' });
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack);

  // CORS errors
  if (err.message && err.message.includes('CORS Error')) {
    return res.status(403).json({
      message: 'Akses Ditolak (CORS)',
      error: err.message,
      tip: 'Pastikan FRONTEND_URL di Hostinger sudah sesuai dengan domain yang Anda gunakan saat ini.'
    });
  }

  // Multer file upload errors
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
    }
    return res.status(400).json({ message: `Kesalahan upload file: ${err.message}` });
  }
  if (err.message && err.message.toLowerCase().includes('file gambar')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
});

// Start Server
const http = require('http');
const server = http.createServer(app);
const socket = require('./socket');

socket.init(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
