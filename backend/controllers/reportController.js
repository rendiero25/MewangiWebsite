const Report = require('../models/Report');
const ForumTopic = require('../models/ForumTopic');
const ForumComment = require('../models/ForumComment');
const Notification = require('../models/Notification');

// @desc    Buat laporan baru
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const reporterId = req.user._id;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Tipe target, ID target, dan alasan wajib diisi' });
    }

    // Cek apakah laporan serupa sudah ada untuk mencegah spam laporan
    const existing = await Report.findOne({
      reporter: reporterId,
      targetId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'Anda sudah melaporkan konten ini' });
    }

    const report = await Report.create({
      reporter: reporterId,
      targetType,
      targetId,
      reason,
      description
    });

    res.status(201).json({ message: 'Laporan berhasil dikirim. Admin akan segera meninjau.', report });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim laporan', error: error.message });
  }
};

// @desc    Ambil semua laporan (admin)
// @route   GET /api/reports
// @access  Private (admin)
const getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const reports = await Report.find({ status })
      .populate('reporter', 'username avatar')
      .populate({
        path: 'targetId',
        select: 'content title author username avatar', // fields to show for topics/comments
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments({ status });

    res.json({
      reports,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil laporan', error: error.message });
  }
};

// @desc    Selesaikan laporan (admin)
// @route   PUT /api/reports/:id/resolve
// @access  Private (admin)
const resolveReport = async (req, res) => {
  try {
    const { action, reason } = req.body; // Action can be 'dismissed', 'deleted', 'banned'
    const adminId = req.user._id;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    report.status = action === 'dismissed' ? 'dismissed' : 'resolved';
    report.resolution = {
      action,
      reason,
      resolvedBy: adminId,
      resolvedAt: new Date()
    };

    await report.save();

    // Opsional: Kirim notifikasi ke pelapor
    const notification = await Notification.create({
      recipient: report.reporter,
      type: 'system',
      message: `Laporan Anda tentang ${report.targetType} telah ${action === 'dismissed' ? 'ditolak' : 'diselesaikan'}.`,
      link: '#'
    });

    const socket = require('../socket');
    socket.getIO().to(report.reporter.toString()).emit('new_notification', notification);

    res.json({ message: `Laporan berhasil ditandai sebagai ${report.status}`, report });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyelesaikan laporan', error: error.message });
  }
};

module.exports = { createReport, getReports, resolveReport };
