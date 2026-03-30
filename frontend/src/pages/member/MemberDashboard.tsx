import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  category: string;
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Hapus review ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/reviews/${id}`, { headers });
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch { alert('Gagal menghapus review.'); }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Hapus artikel ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/articles/${id}`, { headers });
      setArticles(prev => prev.filter(a => a._id !== id));
    } catch { alert('Gagal menghapus artikel.'); }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Hapus topik ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/forum/${id}`, { headers });
      setTopics(prev => prev.filter(t => t._id !== id));
    } catch { alert('Gagal menghapus topik.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Halo, <span className="text-primary">{user?.username}</span>! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola review dan artikel yang sudah kamu tulis.</p>
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
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/review/new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tulis Review
          </Link>
          <Link to="/blog/new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tulis Artikel
          </Link>
          <Link to="/forum/new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Buat Topik Forum
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Reviews */}
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Review Saya</h2>
              <span className="text-xs text-gray-400">{reviews.length} total</span>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Belum ada review.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {reviews.map((r) => (
                  <div key={r._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                        <p className="text-xs text-gray-400">Review Parfum · {formatDate(r.createdAt)}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {r.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <Link to={`/review/edit/${r._id}`} className="shrink-0 px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                          ✏️ Edit
                        </Link>
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
                        <button className="cursor-pointer" onClick={() => handleDeleteReview(r._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
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
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Artikel Saya</h2>
              <span className="text-xs text-gray-400">{articles.length} total</span>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : articles.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Belum ada artikel.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {articles.map((a) => (
                  <div key={a._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-gray-400">{a.category} · {formatDate(a.createdAt)}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {a.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <Link to={`/blog/edit/${a._id}`} className="shrink-0 px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                          ✏️ Edit
                        </Link>
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
                        <button className="cursor-pointer" onClick={() => handleDeleteArticle(a._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
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
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Topik Forum Saya</h2>
              <span className="text-xs text-gray-400">{topics.length} total</span>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : topics.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Belum ada topik.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {topics.map((t) => (
                  <div key={t._id} className="px-6 py-4 flex flex-col hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">{t.category} · {formatDate(t.createdAt)}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.status === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <strong className="block mb-0.5">Alasan Penolakan:</strong>
                          {t.rejectionReason || 'Tidak ada alasan spesifik.'}
                        </div>
                        <Link to={`/forum/edit/${t._id}`} className="shrink-0 px-3 py-1.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-center">
                          ✏️ Edit
                        </Link>
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
                        <button className="cursor-pointer" onClick={() => handleDeleteTopic(t._id)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
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
    </div>
  );
}
