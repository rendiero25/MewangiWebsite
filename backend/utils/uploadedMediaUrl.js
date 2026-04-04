/**
 * URL gambar setelah multer (+ middleware Cloudinary bila aktif).
 */
function getUploadedUrl(req) {
  if (!req.file) return '';
  if (req.file.secure_url) return req.file.secure_url;
  if (req.file.filename) return `/uploads/${req.file.filename}`;
  return '';
}

module.exports = { getUploadedUrl };
