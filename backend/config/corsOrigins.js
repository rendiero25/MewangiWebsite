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

  const primary = process.env.FRONTEND_URL?.replace(/\/$/, '');
  if (primary) {
    origins.add(primary);
  }

  const extra = process.env.CORS_ORIGINS;
  if (extra) {
    extra.split(',').forEach((o) => {
      const trimmed = o.trim().replace(/\/$/, '');
      if (trimmed) origins.add(trimmed);
    });
  }

  return [...origins];
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

module.exports = { getAllowedOrigins, isOriginAllowed };
