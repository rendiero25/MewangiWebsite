import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import TopicCard from '../../components/public/TopicCard';
import Breadcrumbs from '../../components/public/Breadcrumbs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Topic {
  _id: string;
  title: string;
  content: string;
  category: { name: string; slug: string; icon?: string };
  author: { username: string; avatar?: string };
  tags: string[];
  prefix?: string;
  type: string;
  views: number;
  replyCount: number;
  isPinned: boolean;
  isClosed: boolean;
  isFeatured: boolean;
  isAnnouncement: boolean;
  slug: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  lastReplyAt: string;
}

export default function ForumList() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(data);
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 25, sort };
      if (activeCategory !== 'Semua') params.category = activeCategory;
      if (search) params.search = search;

      const { data } = await axios.get(`${API_URL}/forum`, { params });
      setTopics(data.topics);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      const errorMsg = (err as any)?.response?.data?.message || 'Gagal memuat topik';
      console.error('Gagal memuat topik:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, sort, page]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    // Debounce search input
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                Forum <span className="text-primary">Diskusi</span>
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Diskusikan, tanyakan, dan bagikan tentang dunia parfum bersama komunitas.
              </p>
            </div>
            {user && (
              <Link
                to="/forum/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Topik
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumbs items={[{ label: 'Forum', to: '/forum' }]} />

        {/* Search & filters */}
        <div className="mb-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">Silakan tunggu beberapa saat dan coba lagi.</p>
              </div>
            </div>
          )}
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Cari topik diskusi..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory('Semua'); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === 'Semua'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'
              }`}
            >
              Semua
            </button>
            {!loadingCats && categories.filter(c => c.name !== 'Jual Beli').map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Urutkan:</span>
              <div className="flex gap-1">
                {[
                  { id: 'latest', label: 'Terbaru' },
                  { id: 'popular', label: 'Terpopuler' },
                  { id: 'replies', label: 'Paling Banyak Balasan' },
                  { id: 'relevance', label: 'Relevansi', searchOnly: true }
                ].map((s) => (
                  (!s.searchOnly || search) && (
                    <button
                      key={s.id}
                      onClick={() => { setSort(s.id); setPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        sort === s.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            {total} topik ditemukan
            {search && <> untuk "<span className="font-medium text-gray-600">{search}</span>"</>}
          </p>
        )}

        {/* Topics list */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="hidden sm:block w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-xl w-1/4" />
                    <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : topics.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-1">Belum ada topik</p>
              <p className="text-sm text-gray-400">Jadilah yang pertama memulai diskusi!</p>
            </div>
          ) : (
            topics.map((topic) => <TopicCard key={topic._id} topic={topic} />)
          )}
        </div>

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
                        ? 'bg-primary text-white shadow-md'
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
