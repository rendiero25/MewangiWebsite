import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface MyReview {
  _id: string;
  title: string;
  status: string;
  perfume: string;
  createdAt: string;
  rejectionReason?: string;
}

interface MyArticle {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  createdAt: string;
  rejectionReason?: string;
}

interface MyTopic {
  _id: string;
  title: string;
  status: string;
  category: string | { name: string };
  createdAt: string;
  rejectionReason?: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-600',
    draft: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [articles, setArticles] = useState<MyArticle[]>([]);
  const [topics, setTopics] = useState<MyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Per-section Filters
  const [reviewFilters, setReviewFilters] = useState({ status: 'all', sort: 'latest', search: '' });
  const [articleFilters, setArticleFilters] = useState({ status: 'all', sort: 'latest', search: '' });
  const [topicFilters, setTopicFilters] = useState({ status: 'all', sort: 'latest', search: '' });

  const [searchQuery, setSearchQuery] = useState(''); // Global search remains for the pop-out
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, artRes, topRes] = await Promise.all([
        axios.get(`${API_URL}/reviews/my/list`, { headers: { Authorization: `Bearer ${user?.token}` } }),
        axios.get(`${API_URL}/articles/my/list`, { headers: { Authorization: `Bearer ${user?.token}` } }),
        axios.get(`${API_URL}/forum/my/list`, { headers: { Authorization: `Bearer ${user?.token}` } }),
      ]);
      setReviews(revRes.data);
      setArticles(artRes.data);
      setTopics(topRes.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      const element = document.getElementById(tab === 'forum' ? 'forum' : tab);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const handleDeleteReview = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Review?',
      message: 'Apakah Anda yakin ingin menghapus review ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/reviews/${id}`, { headers });
          setReviews(prev => prev.filter(r => r._id !== id));
        } catch { 
          alert('Gagal menghapus review.'); 
        }
      }
    });
  };

  const handleDeleteArticle = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Artikel?',
      message: 'Apakah Anda yakin ingin menghapus artikel ini? Semua konten artikel akan hilang selamanya.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/articles/${id}`, { headers });
          setArticles(prev => prev.filter(a => a._id !== id));
        } catch { 
          alert('Gagal menghapus artikel.'); 
        }
      }
    });
  };

  const handleDeleteTopic = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Topik Forum?',
      message: 'Apakah Anda yakin ingin menghapus topik ini? Semua komentar di dalamnya juga akan terhapus.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/forum/${id}`, { headers });
          setTopics(prev => prev.filter(t => t._id !== id));
        } catch { 
          alert('Gagal menghapus topik.'); 
        }
      }
    });
  };

  const getFilteredAndSorted = <T extends MyReview | MyArticle | MyTopic>(data: T[], filters: { status: string, sort: string, search: string }) => {
    return data.filter(item => {
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const title = 'title' in item ? item.title : '';
      const matchesSearch = !filters.search || title.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (filters.sort === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (filters.sort === 'az') return a.title.localeCompare(b.title);
      return 0;
    });
  };

  const searchInData = <T extends MyReview | MyArticle | MyTopic>(data: T[]) => {
    if (!searchQuery) return [];
    return data.filter(item => {
      const title = 'title' in item ? item.title : '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const filteredReviews = getFilteredAndSorted(reviews, reviewFilters);
  const filteredArticles = getFilteredAndSorted(articles, articleFilters);
  const filteredTopics = getFilteredAndSorted(topics, topicFilters);

  const searchReviews = searchInData(reviews);
  const searchArticles = searchInData(articles);
  const searchTopics = searchInData(topics);
  const totalSearchCount = searchReviews.length + searchArticles.length + searchTopics.length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Halo, <span className="text-primary">{user?.username}</span>! 👋
          </h1>
          <p className="text-sm text-black mt-1">Kelola review, forum, dan artikel yang sudah kamu tulis.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Review', value: reviews.length, color: 'from-amber-400 to-orange-500' },
            { label: 'Review Pending', value: reviews.filter(r => r.status === 'pending').length, color: 'from-blue-400 to-indigo-500' },
            { label: 'Total Artikel', value: articles.length, color: 'from-indigo-400 to-purple-500' },
            { label: 'Artikel Pending', value: articles.filter(a => a.status === 'pending').length, color: 'from-emerald-400 to-teal-500' },
            { label: 'Total Topik', value: topics.length, color: 'from-pink-400 to-rose-500' },
            { label: 'Topik Pending', value: topics.filter(t => t.status === 'pending').length, color: 'from-sky-400 to-cyan-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between items-start">
              <p className="text-2xl text-black font-normal mb-5">{stat.label}</p>
              <p className={`text-5xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Global Search Bar (Pop-out results only) */}
        <div className="bg-white rounded-xl border border-gray-100 mb-8 shadow-sm">
          <div className="relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari cepat ke semua konten Anda..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(!!e.target.value);
              }}
              onFocus={() => setShowSearchResults(!!searchQuery)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
            />
            {/* Pop-out Search Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-2">
                  {searchReviews.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Reviews</h4>
                      {searchReviews.slice(0, 5).map(r => (
                        <div key={r._id} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                          <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : r.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
                            <span className="text-[9px] text-gray-500 font-medium">Review</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchArticles.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Artikel</h4>
                      {searchArticles.slice(0, 5).map(a => (
                        <div key={a._id} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                          <p className="text-xs font-bold text-gray-900 truncate">{a.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${a.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : a.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>{a.status}</span>
                            <span className="text-[9px] text-gray-500 font-medium">Artikel</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchTopics.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">Topik Forum</h4>
                      {searchTopics.slice(0, 5).map(t => (
                        <div key={t._id} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                          <p className="text-xs font-bold text-gray-900 truncate">{t.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : t.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>{t.status}</span>
                            <span className="text-[9px] text-gray-500 font-medium">Forum</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {totalSearchCount === 0 && (
                    <div className="p-8 text-center text-xs text-gray-500">Tidak ada hasil ditemukan.</div>
                  )}
                </div>
                {totalSearchCount > 0 && (
                  <div className="p-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-medium italic">Hasil teratas ditampilkan</span>
                    <button onClick={() => setShowSearchResults(false)} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Tutup</button>
                  </div>
                )}
              </div>
            )}
            {showSearchResults && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSearchResults(false)} />}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/review/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all hover:shadow-md hover:shadow-amber-200/20 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tulis Review
          </Link>
          <Link to="/blog/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all hover:shadow-md hover:shadow-indigo-200/20 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tulis Artikel
          </Link>
          <Link to="/forum/new" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-primary bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-all hover:shadow-md hover:shadow-primary/20 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Buat Topik
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Reviews */}
          <section id="reviews" className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-white to-gray-50/50">
              <h2 className="font-bold text-gray-900 shrink-0">Review Saya ({filteredReviews.length})</h2>
              
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={reviewFilters.status}
                  onChange={(e) => setReviewFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="all">Semua Status</option>
                  <option value="approved">Disetujui</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Ditolak</option>
                  <option value="draft">Draft</option>
                </select>
                <select 
                  value={reviewFilters.sort}
                  onChange={(e) => setReviewFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="latest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="az">A-Z</option>
                </select>
                {(reviewFilters.status !== 'all' || reviewFilters.sort !== 'latest') && (
                  <button 
                    onClick={() => setReviewFilters({ status: 'all', sort: 'latest', search: '' })}
                    className="px-2 py-1.5 text-[10px] font-black text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">Belum ada review.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {filteredReviews.map((r) => (
                  <div key={r._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                        <p className="text-xs text-gray-500">Review Parfum · {formatDate(r.createdAt)}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {r.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/review/edit/${r._id}`} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                            ✏️ Edit
                          </Link>
                          <button onClick={() => handleDeleteReview(r._id)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    )}
                    {r.status === 'draft' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/review/edit/${r._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteReview(r._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {r.status === 'pending' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/review/edit/${r._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteReview(r._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {r.status === 'approved' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/review/${r._id}`} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
                          🌐 Buka
                        </Link>
                        <Link to={`/review/edit/${r._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteReview(r._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Articles */}
          <section id="articles" className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-white to-gray-50/50">
              <h2 className="font-bold text-gray-900 shrink-0">Artikel Saya ({filteredArticles.length})</h2>

              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={articleFilters.status}
                  onChange={(e) => setArticleFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="all">Semua Status</option>
                  <option value="approved">Disetujui</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Ditolak</option>
                  <option value="draft">Draft</option>
                </select>
                <select 
                  value={articleFilters.sort}
                  onChange={(e) => setArticleFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="latest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="az">A-Z</option>
                </select>
                {(articleFilters.status !== 'all' || articleFilters.sort !== 'latest') && (
                  <button 
                    onClick={() => setArticleFilters({ status: 'all', sort: 'latest', search: '' })}
                    className="px-2 py-1.5 text-[10px] font-black text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">Belum ada artikel.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {filteredArticles.map((a) => (
                  <div key={a._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.category} · {formatDate(a.createdAt)}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {a.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/blog/edit/${a._id}`} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                            ✏️ Edit
                          </Link>
                          <button onClick={() => handleDeleteArticle(a._id)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    )}
                    {a.status === 'draft' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/blog/edit/${a._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteArticle(a._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {a.status === 'pending' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/blog/edit/${a._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteArticle(a._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {a.status === 'approved' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/blog/${a.slug}`} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
                          🌐 Buka
                        </Link>
                        <Link to={`/blog/edit/${a._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteArticle(a._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Topics */}
          <section id="forum" className="bg-white rounded-xl border border-gray-100 overflow-hidden lg:col-span-2 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-white to-gray-50/50">
              <h2 className="font-bold text-gray-900 shrink-0">Topik Forum Saya ({filteredTopics.length})</h2>

              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={topicFilters.status}
                  onChange={(e) => setTopicFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="all">Semua Status</option>
                  <option value="approved">Disetujui</option>
                  <option value="pending">Pending</option>
                   <option value="rejected">Ditolak</option>
                  <option value="draft">Draft</option>
                </select>
                <select 
                  value={topicFilters.sort}
                  onChange={(e) => setTopicFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
                >
                  <option value="latest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="az">A-Z</option>
                </select>
                {(topicFilters.status !== 'all' || topicFilters.sort !== 'latest') && (
                  <button 
                    onClick={() => setTopicFilters({ status: 'all', sort: 'latest', search: '' })}
                    className="px-2 py-1.5 text-[10px] font-black text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">Belum ada topik.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {filteredTopics.map((t) => (
                  <div key={t._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-500">{typeof t.category === 'object' ? t.category.name : t.category} · {formatDate(t.createdAt)}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {t.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/forum/edit/${t._id}`} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                            ✏️ Edit
                          </Link>
                          <button onClick={() => handleDeleteTopic(t._id)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    )}
                    {t.status === 'draft' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/forum/edit/${t._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteTopic(t._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {t.status === 'pending' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/forum/edit/${t._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteTopic(t._id)} className="text-xs font-semibold px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                    {t.status === 'approved' && (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/forum/${t._id}`} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
                          🌐 Buka
                        </Link>
                        <Link to={`/forum/edit/${t._id}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                          ✏️ Edit
                        </Link>
                        <button onClick={() => handleDeleteTopic(t._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant={modalConfig.variant as 'danger' | 'primary' | 'success'}
      />
    </div>
  );
}
