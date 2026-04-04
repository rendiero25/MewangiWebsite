const cloudinary = require('cloudinary').v2;

function isCloudinaryEnabled() {
  const url = process.env.CLOUDINARY_URL;
  if (url && url.toLowerCase().startsWith('cloudinary://')) {
    return true;
  }
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryEnabled() && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Ekstrak public_id dari URL delivery Cloudinary (untuk destroy).
 */
function publicIdFromSecureUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;
  try {
    const noQuery = url.split('?')[0];
    const mark = '/upload/';
    const i = noQuery.indexOf(mark);
    if (i === -1) return null;
    let tail = noQuery.slice(i + mark.length);
    tail = tail.replace(/^v\d+\//, '');
    const lastDot = tail.lastIndexOf('.');
    const lastSlash = tail.lastIndexOf('/');
    if (lastDot > lastSlash) {
      tail = tail.slice(0, lastDot);
    }
    return tail || null;
  } catch {
    return null;
  }
}

async function destroyCloudinaryAssetByUrl(url) {
  const publicId = publicIdFromSecureUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.warn('[Cloudinary] destroy gagal:', err.message);
  }
}

module.exports = {
  cloudinary,
  isCloudinaryEnabled,
  publicIdFromSecureUrl,
  destroyCloudinaryAssetByUrl,
};
