const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user baru
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek apakah user sudah ada
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email
          ? 'Email sudah terdaftar'
          : 'Username sudah dipakai',
      });
    }

    // Buat verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 jam

    // Buat user
    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpire,
    });

    // Kirim email verifikasi
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verifikasi Akun Mewangi Indonesia',
        html: `
          <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #009545;">Selamat Datang di Mewangi Indonesia! 🌿</h2>
            <p>Halo <strong>${user.username}</strong>,</p>
            <p>Terima kasih telah mendaftar di komunitas parfum Mewangi Indonesia.</p>
            <p>Klik tombol di bawah untuk verifikasi akun Anda:</p>
            <a href="${verifyUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #009545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Verifikasi Akun
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Link ini berlaku selama 24 jam. Jika Anda tidak mendaftar di Mewangi, abaikan email ini.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Gagal kirim email verifikasi:', emailError);
      // Tetap lanjut, user bisa request ulang verifikasi nanti
    }

    res.status(201).json({
      message: 'Registrasi berhasil! Cek email Anda untuk verifikasi akun.',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal register', error: error.message });
  }
};

// @desc    Verifikasi email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token verifikasi tidak valid, sudah kadaluarsa, atau akun Anda sudah pernah diverifikasi sebelumnya.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({ message: 'Email berhasil diverifikasi! Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal verifikasi', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user + include password & login fields
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Cek apakah akun sedang terkunci
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Akun Anda terkunci sementara karena terlalu banyak percobaan login. Silakan coba lagi dalam ${remainingMinutes} menit.` 
      });
    }

    // Cek password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Kunci 30 menit
      }
      await user.save();
      
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Harap verifikasi email Anda terlebih dahulu melalui link yang dikirimkan ke email Anda untuk bisa masuk.' });
    }

    // Login sukses: Reset attempts dan update lastActive
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastActive = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mendapatkan profil', error: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'User dengan email tersebut tidak ditemukan' });
    }

    // Buat reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 menit

    await user.save();

    // Kirim email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #009545;">Reset Password Mewangi Indonesia 🌿</h2>
        <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta pengaturan ulang password untuk akun Anda.</p>
        <p>Klik tombol di bawah untuk mereset password Anda:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #009545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Link ini hanya berlaku selama 10 menit. Jika Anda tidak merasa meminta ini, abaikan email ini.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Password Mewangi Indonesia',
        html: message,
      });

      res.status(200).json({ message: 'Email reset password telah dikirim' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email tidak dapat dikirim' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal proses forgot password', error: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kadaluarsa' });
    }

    // Set password baru
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password berhasil diubah, silakan login kembali' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal reset password', error: error.message });
  }
};

// @desc    Resend email verifikasi
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Akun Anda sudah terverifikasi' });
    }

    // Update token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Kirim email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verifikasi Akun Mewangi Indonesia',
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #009545;">Verifikasi Ulang Akun Mewangi Indonesia 🌿</h2>
          <p>Halo <strong>${user.username}</strong>,</p>
          <p>Klik tombol di bawah untuk verifikasi akun Anda:</p>
          <a href="${verifyUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #009545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Verifikasi Akun
          </a>
        </div>
      `,
    });

    res.json({ message: 'Email verifikasi telah dikirim ulang' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal kirim ulang verifikasi', error: error.message });
  }
};

module.exports = { 
  register, 
  verifyEmail, 
  login, 
  getMe, 
  resendVerification,
  forgotPassword,
  resetPassword 
};
