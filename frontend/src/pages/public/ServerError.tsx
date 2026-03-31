import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-gray-900">
      <div className="text-center max-w-lg">
        {/* 500 Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-8xl font-black text-red-200/50 dark:text-red-900/50 select-none">500</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18zm0 2a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Kesalahan Server</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Terjadi kesalahan pada server kami. Tim kami sedang bekerja untuk memperbaikinya. Silakan coba lagi nanti.
        </p>

        {/* Error Details */}
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">
            Error Code: 500 - Internal Server Error
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            aria-label="Muat ulang halaman"
          >
            Muat Ulang
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Kembali ke beranda"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Masalah terus berlanjut?</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            aria-label="Hubungi dukungan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Hubungi dukungan
          </Link>
        </div>
      </div>
    </div>
  );
}
