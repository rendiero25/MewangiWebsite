const multer = require('multer');
const path = require('path');
const { cloudinary, isCloudinaryEnabled } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'), false);
  }
};

const limits = { fileSize: 5 * 1024 * 1024 };

const storage = isCloudinaryEnabled()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
      },
      filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({ storage, fileFilter, limits });

/**
 * Unggah buffer ke Cloudinary. Lewati jika penyimpanan lokal atau tidak ada file.
 */
function cloudinaryUpload(subfolder) {
  const folderBase = 'mewangi';

  return async (req, res, next) => {
    if (!req.file || !req.file.buffer) {
      return next();
    }

    try {
      const folder = `${folderBase}/${subfolder}`;
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
          },
          (err, uploaded) => (err ? reject(err) : resolve(uploaded))
        );
        stream.end(req.file.buffer);
      });

      req.file.secure_url = result.secure_url;
      req.file.public_id = result.public_id;
      delete req.file.buffer;
      next();
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(502).json({
        message: 'Gagal mengunggah gambar ke Cloudinary',
        error: err.message,
      });
    }
  };
}

module.exports = upload;
module.exports.cloudinaryUpload = cloudinaryUpload;
