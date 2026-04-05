/**
 * Daftar origin yang diizinkan untuk CORS (REST) dan Socket.IO.
 * - FRONTEND_URL: origin utama (wajib di produksi untuk domain situs)
 * - CORS_ORIGINS: tambahan, pisahkan dengan koma (mis. https://www.mewangi.id)
 */
function getAllowedOrigins() {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ]);

  const addWithWwwVariations = (url) => {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/$/, '').toLowerCase();
    if (!cleanUrl) return;
    
    origins.add(cleanUrl);
    
    // Auto-add www or non-www variation
    if (cleanUrl.includes('://www.')) {
      origins.add(cleanUrl.replace('://www.', '://'));
    } else if (cleanUrl.includes('://')) {
      origins.add(cleanUrl.replace('://', '://www.'));
    }
  };

  addWithWwwVariations(process.env.FRONTEND_URL);

  const extra = process.env.CORS_ORIGINS;
  if (extra) {
    extra.split(',').forEach((o) => addWithWwwVariations(o));
  }

  const allowedList = [...origins];
  if (process.env.NODE_ENV === 'production') {
    console.log('[CORS] Allowed Origins:', allowedList.join(', '));
  }
  
  return allowedList;
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin.toLowerCase());
}

module.exports = { getAllowedOrigins, isOriginAllowed };
