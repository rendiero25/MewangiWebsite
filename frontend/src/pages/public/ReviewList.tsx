import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReviewCard from '../../components/public/ReviewCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ReviewData {
  _id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  rating: { longevity: number; sillage: number; valueForMoney: number; overall: number };
  occasion: string[];
  season: string[];
  image?: string;
  views: number;
  createdAt: string;
}

export default function ReviewList() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOccasion, setActiveOccasion] = useState('Semua');
  const [activeSeason, setActiveSeason] = useState('Semua');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const occasions = ['Semua', 'Sehari-hari', 'Kantor', 'Kencan', 'Pesta', 'Olahraga', 'Formal'];
  const seasons = ['Semua', 'Panas', 'Hujan', 'Sejuk', 'Sepanjang Tahun'];

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (search) params.search = search;
      if (activeOccasion !== 'Semua') params.occasion = activeOccasion;
      if (activeSeason !== 'Semua') params.season = activeSeason;

      const { data } = await axios.get(`${API_URL}/reviews`, { params });
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Gagal memuat review:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, activeOccasion, activeSeason]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                Review <span className="text-amber-500">Parfum</span>
              </h1>
              <p className="text-black text-sm sm:text-base">
                Baca review mendalam dari komunitas. Longevity, sillage, dan value for money.
              </p>
            </div>
            {user && (
              <Link
                to="/review/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tulis Review
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search & filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari review parfum..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-black mr-2">Acara:</span>
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => { setActiveOccasion(occ); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeOccasion === occ
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-black mr-2">Musim:</span>
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => { setActiveSeason(s); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeSeason === s
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-black mb-4">
            {total} review ditemukan
            {search && <> untuk "<span className="font-medium text-gray-600">{search}</span>"</>}
          </p>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border border-gray-100 animate-pulse overflow-hidden">
                <div className="h-56 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded-xl w-2/3" />
                  <div className="h-4 bg-gray-200 rounded-xl w-full" />
                  <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">Belum ada review</p>
            <p className="text-sm text-gray-400">Jadilah yang pertama me-review parfum!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      page === p
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
