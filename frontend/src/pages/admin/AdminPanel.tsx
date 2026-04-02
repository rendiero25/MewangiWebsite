import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminReports from './AdminReports';
import { MdBlock, MdCheckCircle } from 'react-icons/md';
import Avatar from '../../components/common/Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Tab = 'overview' | 'reviews' | 'articles' | 'topics' | 'users' | 'reports';

interface Stats { 
  totalUsers: number; 
  totalPerfumes: number; 
  pendingReviews: number; 
  pendingArticles: number; 
  pendingTopics: number; 
  totalTopics: number; 
  approvedReviews?: number;
  approvedArticles?: number;
  totalComments?: number;
  activeToday?: number;
  totalReports?: number;
}
interface PendingReview { _id: string; title: string; content: string; image?: string; occasion?: string[]; season?: string[]; author: { username: string; email: string };
  rating: { overall: number; longevity: number; sillage: number; valueForMoney: number }; createdAt: string; status: string; rejectionReason?: string; }
interface PendingArticle { _id: string; slug: string; title: string; content: string; excerpt?: string; coverImage?: string; category: string; tags?: string[]; author: { username: string; email: string }; createdAt: string; status: string; rejectionReason?: string; }
interface PendingTopic { _id: string; title: string; content: string; category: string; author: { username: string; avatar?: string; email: string }; createdAt: string; status: string; rejectionReason?: string; }
interface UserData { _id: string; username: string; email: string; avatar?: string; role: string; isVerified: boolean; isBanned?: boolean; banExpires?: string; createdAt: string }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [onlineReviews, setOnlineReviews] = useState<PendingReview[]>([]);
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [onlineArticles, setOnlineArticles] = useState<PendingArticle[]>([]);
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  const [onlineTopics, setOnlineTopics] = useState<PendingTopic[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<{ type: 'review', data: PendingReview } | { type: 'article', data: PendingArticle } | { type: 'topic', data: PendingTopic } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  
  // Search
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, revReq, revOnl, artReq, artOnl, topReq, topOnl, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/reviews/pending`, { headers }),
        axios.get(`${API_URL}/admin/reviews/online`, { headers }),
        axios.get(`${API_URL}/admin/articles/pending`, { headers }),
        axios.get(`${API_URL}/admin/articles/online`, { headers }),
        axios.get(`${API_URL}/admin/topics/pending`, { headers }),
        axios.get(`${API_URL}/admin/topics/online`, { headers }),
        axios.get(`${API_URL}/admin/users`, { headers }),
      ]);
      setStats(statsRes.data);
      setPendingReviews(revReq.data);
      setOnlineReviews(revOnl.data);
      setPendingArticles(artReq.data);
      setOnlineArticles(artOnl.data);
      setPendingTopics(topReq.data);
      setOnlineTopics(topOnl.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Gagal memuat data admin:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReviewAction = async (id: string, status: 'approved' | 'rejected', reason: string = '') => {
    try {
      await axios.put(`${API_URL}/admin/reviews/${id}/status`, { status, rejectionReason: reason }, { headers });
      fetchAll();
      if (viewingItem?.data._id === id) setViewingItem(null);
    } catch { alert('Gagal mengupdate review.'); }
  };

  const handleArticleAction = async (id: string, status: 'approved' | 'rejected', reason: string = '') => {
    try {
      await axios.put(`${API_URL}/admin/articles/${id}/status`, { status, rejectionReason: reason }, { headers });
      fetchAll();
      if (viewingItem?.data._id === id) setViewingItem(null);
    } catch { alert('Gagal mengupdate artikel.'); }
  };

  const handleTopicAction = async (id: string, status: 'approved' | 'rejected', reason: string = '') => {
    try {
      await axios.put(`${API_URL}/admin/topics/${id}/status`, { status, rejectionReason: reason }, { headers });
      fetchAll();
      if (viewingItem?.data._id === id) setViewingItem(null);
    } catch { alert('Gagal mengupdate topik.'); }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Hapus review ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/reviews/${id}`, { headers });
      setOnlineReviews(prev => prev.filter(r => r._id !== id));
      setStats(prev => prev ? { ...prev, pendingReviews: prev.pendingReviews } : null); // Trigger refresh or just use fetchAll
      fetchAll();
    } catch { alert('Gagal menghapus review.'); }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Hapus artikel ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/articles/${id}`, { headers });
      setOnlineArticles(prev => prev.filter(a => a._id !== id));
      fetchAll();
    } catch { alert('Gagal menghapus artikel.'); }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Hapus topik forum ini secara permanen?')) return;
    try {
      await axios.delete(`${API_URL}/forum/${id}`, { headers });
      setOnlineTopics(prev => prev.filter(t => t._id !== id));
      fetchAll();
    } catch { alert('Gagal menghapus topik.'); }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await axios.put(`${API_URL}/admin/users/${id}/role`, { role }, { headers });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
    } catch { alert('Gagal mengubah role.'); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, { headers });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch { alert('Gagal menghapus user.'); }
  };

  const handleBanUser = async (id: string) => {
    const reason = prompt('Alasan pemblokiran:', 'Melanggar aturan komunitas');
    if (reason === null) return;
    const duration = prompt('Durasi (hari, 0 untuk permanen):', '0');
    if (duration === null) return;

    try {
      await axios.post(`${API_URL}/admin/users/${id}/ban`, { reason, duration: Number(duration) }, { headers });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: true } : u));
    } catch { alert('Gagal memblokir user.'); }
  };

  const handleUnbanUser = async (id: string) => {
    if (!confirm('Buka blokir user ini?')) return;
    try {
      await axios.post(`${API_URL}/admin/users/${id}/unban`, {}, { headers });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: false } : u));
    } catch { alert('Gagal membuka blokir user.'); }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'reviews', label: 'Review', count: pendingReviews.length },
    { key: 'articles', label: 'Artikel', count: pendingArticles.length },
    { key: 'topics', label: 'Topik Forum', count: pendingTopics.length },
    { key: 'users', label: 'Users' },
    { key: 'reports', label: 'Laporan', count: 0 }, // We can fetch count if needed
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin <span className="text-primary">Panel</span>
          </h1>

          {/* Global Search */}
          <div className="relative w-full md:w-96">
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari user, review, artikel, atau topik..."
                value={adminSearchQuery}
                onChange={(e) => {
                  setAdminSearchQuery(e.target.value);
                  setShowSearchResults(!!e.target.value);
                }}
                onFocus={() => setShowSearchResults(!!adminSearchQuery)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm"
              />
            </div>

            {/* Pop-out Search Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 max-h-[400px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-2">
                  {/* User Results */}
                  {users.filter(u => u.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(adminSearchQuery.toLowerCase())).length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Users</h4>
                      {users.filter(u => u.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(adminSearchQuery.toLowerCase())).slice(0, 5).map(u => (
                        <button key={u._id} onClick={() => { setActiveTab('users'); setShowSearchResults(false); }} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer">
                          <Avatar src={u.avatar} size="xs" alt={u.username} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{u.username}</p>
                            <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Review Results */}
                  {onlineReviews.concat(pendingReviews).filter(r => r.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Reviews</h4>
                      {onlineReviews.concat(pendingReviews).filter(r => r.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).slice(0, 5).map(r => (
                        <button key={r._id} onClick={() => { 
                          setActiveTab('reviews'); 
                          setViewingItem({ type: 'review', data: r }); 
                          setShowSearchResults(false);
                        }} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group cursor-pointer">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{r.title}</p>
                          <p className="text-[10px] text-gray-400">Oleh {r.author?.username}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Article Results */}
                  {onlineArticles.concat(pendingArticles).filter(a => a.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Artikel</h4>
                      {onlineArticles.concat(pendingArticles).filter(a => a.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).slice(0, 5).map(a => (
                        <button key={a._id} onClick={() => { 
                          setActiveTab('articles'); 
                          setViewingItem({ type: 'article', data: a }); 
                          setShowSearchResults(false);
                        }} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group cursor-pointer">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{a.title}</p>
                          <p className="text-[10px] text-gray-400">Oleh {a.author?.username}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Topic Results */}
                  {onlineTopics.concat(pendingTopics).filter(t => t.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <h4 className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Topik Forum</h4>
                      {onlineTopics.concat(pendingTopics).filter(t => t.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).slice(0, 5).map(t => (
                        <button key={t._id} onClick={() => { 
                          setActiveTab('topics'); 
                          setViewingItem({ type: 'topic', data: t }); 
                          setShowSearchResults(false);
                        }} className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group cursor-pointer">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{t.title}</p>
                          <p className="text-[10px] text-gray-400">Oleh {t.author?.username}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {users.filter(u => u.username.toLowerCase().includes(adminSearchQuery.toLowerCase())).length === 0 &&
                   onlineReviews.concat(pendingReviews).filter(r => r.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length === 0 &&
                   onlineArticles.concat(pendingArticles).filter(a => a.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length === 0 &&
                   onlineTopics.concat(pendingTopics).filter(t => t.title.toLowerCase().includes(adminSearchQuery.toLowerCase())).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-xs text-gray-400">Tidak ada hasil ditemukan.</p>
                    </div>
                   )}
                </div>
                <div className="p-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium italic">Hasil teratas ditampilkan</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Tutup</button>
                </div>
              </div>
            )}
            
            {/* Click-away backdrop */}
            {showSearchResults && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSearchResults(false)} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-red-100 text-red-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'from-blue-500 to-indigo-500' },
              { label: 'Total Parfum', value: stats?.totalPerfumes, icon: '🧴', color: 'from-emerald-500 to-teal-500' },
              { label: 'Review Pending', value: stats?.pendingReviews, icon: '⏳', color: 'from-amber-500 to-orange-500' },
              { label: 'Artikel Pending', value: stats?.pendingArticles, icon: '📝', color: 'from-purple-500 to-pink-500' },
              { label: 'Total Topik', value: stats?.totalTopics, icon: '💬', color: 'from-indigo-400 to-blue-500' },
              { label: 'Topik Pending', value: stats?.pendingTopics, icon: '💭', color: 'from-pink-500 to-rose-500' },
              { label: 'Review Approved', value: stats?.approvedReviews, icon: '✓', color: 'from-green-500 to-emerald-500' },
              { label: 'Artikel Approved', value: stats?.approvedArticles, icon: '📄', color: 'from-cyan-500 to-blue-500' },
              { label: 'Total Comments', value: stats?.totalComments, icon: '💬', color: 'from-violet-500 to-purple-500' },
              { label: 'Active Today', value: stats?.activeToday, icon: '🔥', color: 'from-red-500 to-orange-500' },
              { label: 'Total Reports', value: stats?.totalReports, icon: '🚩', color: 'from-red-600 to-pink-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{stat.icon}</span>
                  <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                </div>
                <p className={`text-3xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {loading ? '—' : stat.value ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Dalam Antrean & Revisi ({pendingReviews.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : pendingReviews.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Tidak ada review dalam antrean.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingReviews.map((r) => (
                    <div key={r._id} className="flex flex-col px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {r.status === 'rejected' ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">Revisi</span> : <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Pending</span>}
                            <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                          </div>
                          <p className="text-xs text-gray-400">Oleh {r.author?.username || 'User Terhapus'} · {formatDate(r.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => setViewingItem({ type: 'review', data: r })} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                            👁 Lihat
                          </button>
                          <button onClick={() => handleReviewAction(r._id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                            ✓ Approve
                          </button>
                          <button onClick={() => { setRejectingId(r._id); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                      {rejectingId === r._id && (
                        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-3">
                          <label className="text-sm font-semibold text-red-800">Alasan Penolakan</label>
                          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tulis alasan..." className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-20" />
                          <div className="flex justify-end gap-2">
                             <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer">Batal</button>
                             <button onClick={() => { handleReviewAction(r._id, 'rejected', rejectReason); setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer">Kirim Penolakan</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Review Publik / Online ({onlineReviews.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : onlineReviews.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Belum ada review yang disetujui.</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {onlineReviews.map((r) => (
                    <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                        <p className="text-xs text-gray-400">Oleh {r.author?.username || 'User Terhapus'} · Disetujui {formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`/review/${r._id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                          🌐 Buka
                        </a>
                        <button onClick={() => handleDeleteReview(r._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Dalam Antrean & Revisi ({pendingArticles.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : pendingArticles.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Tidak ada artikel dalam antrean.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingArticles.map((a) => (
                    <div key={a._id} className="flex flex-col px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {a.status === 'rejected' ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">Revisi</span> : <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Pending</span>}
                            <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                          </div>
                          <p className="text-xs text-gray-400">{a.category} · Oleh {a.author?.username || 'User Terhapus'} · {formatDate(a.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => setViewingItem({ type: 'article', data: a })} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                            👁 Lihat
                          </button>
                          <button onClick={() => handleArticleAction(a._id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                            ✓ Approve
                          </button>
                          <button onClick={() => { setRejectingId(a._id); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                      {rejectingId === a._id && (
                        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-3">
                          <label className="text-sm font-semibold text-red-800">Alasan Penolakan</label>
                          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tulis alasan..." className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-20" />
                          <div className="flex justify-end gap-2">
                             <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer">Batal</button>
                             <button onClick={() => { handleArticleAction(a._id, 'rejected', rejectReason); setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer">Kirim Penolakan</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Artikel Publik / Online ({onlineArticles.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : onlineArticles.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Belum ada artikel yang disetujui.</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {onlineArticles.map((a) => (
                    <div key={a._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                        <p className="text-xs text-gray-400">Oleh {a.author?.username || 'User Terhapus'} · Disetujui {formatDate(a.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                          🌐 Buka
                        </a>
                        <button onClick={() => handleDeleteArticle(a._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Dalam Antrean & Revisi ({pendingTopics.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : pendingTopics.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Tidak ada topik dalam antrean.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingTopics.map((t) => (
                    <div key={t._id} className="flex flex-col px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {t.status === 'rejected' ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">Revisi</span> : <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Pending</span>}
                            <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                          </div>
                          <p className="text-xs text-gray-400">{t.category} · Oleh {t.author?.username || 'User Terhapus'} · {formatDate(t.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => setViewingItem({ type: 'topic', data: t })} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                            👁 Lihat
                          </button>
                          <button onClick={() => handleTopicAction(t._id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                            ✓ Approve
                          </button>
                          <button onClick={() => { setRejectingId(t._id); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                      {rejectingId === t._id && (
                        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-3">
                          <label className="text-sm font-semibold text-red-800">Alasan Penolakan</label>
                          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Tulis alasan..." className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-20" />
                          <div className="flex justify-end gap-2">
                             <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer">Batal</button>
                             <button onClick={() => { handleTopicAction(t._id, 'rejected', rejectReason); setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer">Kirim Penolakan</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Topik Publik / Online ({onlineTopics.length})</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : onlineTopics.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">Belum ada topik yang disetujui.</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {onlineTopics.map((t) => (
                    <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">Oleh {t.author?.username || 'User Terhapus'} · Disetujui {formatDate(t.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`/forum/${t._id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                          🌐 Buka
                        </a>
                        <button onClick={() => handleDeleteTopic(t._id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Kelola Users ({users.length})</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Verified</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={u.avatar} size="sm" alt={u.username} className="shrink-0" />
                            <div className="min-w-0">
                              <Link to={`/profile/${u._id}`} className="font-bold text-gray-900 truncate hover:text-primary transition-colors">
                                {u.username}
                              </Link>
                              <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user?._id}
                            className="px-2 py-1 rounded-xl border border-gray-200 text-xs bg-white disabled:opacity-50 cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          {u.isVerified ? (
                            <span className="text-emerald-500 text-xs font-medium">✓ Verified</span>
                          ) : (
                            <span className="text-gray-400 text-xs">Belum</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u._id !== user?._id && u.role !== 'admin' && (
                              <>
                                {u.isBanned ? (
                                  <button onClick={() => handleUnbanUser(u._id)} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 cursor-pointer">
                                    <MdCheckCircle /> Unban
                                  </button>
                                ) : (
                                  <button onClick={() => handleBanUser(u._id)} className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1 cursor-pointer">
                                    <MdBlock /> Ban
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'reports' && (
          <AdminReports />
        )}
      </div>

      {/* Modal View Detail */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm sm:p-6" onClick={() => setViewingItem(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-gray-900">
                Detail {viewingItem.type === 'review' ? 'Review' : viewingItem.type === 'article' ? 'Artikel' : 'Topik'}
              </h3>
              <button onClick={() => setViewingItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grow">
              {viewingItem.type === 'review' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{viewingItem.data.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Oleh {viewingItem.data.author?.username || 'User Terhapus'} · {formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  {viewingItem.data.image && (
                    <img src={`${API_URL.replace('/api', '')}${viewingItem.data.image}`} alt="Review" className="w-full max-h-80 object-cover rounded-xl border border-gray-100" />
                  )}
                  <div className="flex flex-wrap gap-4">
                    {viewingItem.data.occasion && viewingItem.data.occasion.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Occasion</p>
                        <div className="flex gap-1 flex-wrap">{viewingItem.data.occasion.map(o => <span key={o} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-xl text-xs">{o}</span>)}</div>
                      </div>
                    )}
                    {viewingItem.data.season && viewingItem.data.season.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Season</p>
                        <div className="flex gap-1 flex-wrap">{viewingItem.data.season.map(s => <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-xl text-xs">{s}</span>)}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Rating</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                       {(['overall', 'longevity', 'sillage', 'valueForMoney'] as const).map((key) => (
                         <div key={key} className="bg-gray-50 p-2 rounded-xl text-center">
                           <p className="text-[10px] text-gray-400 uppercase tracking-wider">{key}</p>
                           <p className="font-bold text-amber-500">{viewingItem.data.rating?.[key] || 0}/5</p>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Konten</p>
                    {/* The content rendering for react-quill HTML content */}
                    <div className="prose prose-sm max-w-none text-gray-800 bg-white border border-gray-100 p-4 rounded-xl shadow-sm ql-editor" dangerouslySetInnerHTML={{ __html: viewingItem.data.content }} />
                  </div>
                </div>
              )}

              {viewingItem.type === 'article' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-xl">{(viewingItem.data as PendingArticle).category}</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{viewingItem.data.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Oleh {viewingItem.data.author?.username || 'User Terhapus'} · {formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  {(viewingItem.data as PendingArticle).coverImage && (
                    <img src={`${API_URL.replace('/api', '')}${(viewingItem.data as PendingArticle).coverImage}`} alt="Article" className="w-full max-h-96 object-cover rounded-xl border border-gray-100" />
                  )}
                  {(viewingItem.data as PendingArticle).excerpt && (
                    <div className="p-4 bg-gray-50 border-l-4 border-indigo-500 rounded-xl-r-xl italic text-gray-600 text-sm">
                      {(viewingItem.data as PendingArticle).excerpt}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Konten</p>
                    <div className="prose prose-sm max-w-none text-gray-800 bg-white border border-gray-100 p-4 rounded-xl shadow-sm ql-editor" dangerouslySetInnerHTML={{ __html: viewingItem.data.content }} />
                  </div>
                  {(viewingItem.data as PendingArticle).tags && (viewingItem.data as PendingArticle).tags!.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                      {(viewingItem.data as PendingArticle).tags!.map(t => <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">#{t}</span>)}
                    </div>
                  )}
                </div>
              )}

              {viewingItem.type === 'topic' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-xl">{(viewingItem.data as PendingTopic).category}</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{viewingItem.data.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Oleh {viewingItem.data.author?.username || 'User Terhapus'} · {formatDate(viewingItem.data.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Konten Diskusi</p>
                    <div className="prose prose-sm max-w-none text-gray-800 bg-white border border-gray-100 p-4 rounded-xl shadow-sm ql-editor" dangerouslySetInnerHTML={{ __html: viewingItem.data.content }} />
                  </div>
                </div>
              )}
            </div>

            {rejectingId === viewingItem.data._id ? (
              <div className="px-6 py-4 bg-red-50 flex flex-col gap-3 shrink-0">
                 <label className="text-sm font-semibold text-red-800">Alasan Penolakan</label>
                 <textarea
                   value={rejectReason}
                   onChange={(e) => setRejectReason(e.target.value)}
                   placeholder="Tulis alasan kenapa tulisan ini ditolak agar member bisa merevisinya..."
                   className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-sm text-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none h-20"
                 />
                 <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">Batal</button>
                    <button onClick={() => { 
                      if (viewingItem.type === 'review') handleReviewAction(viewingItem.data._id, 'rejected', rejectReason);
                      else if (viewingItem.type === 'article') handleArticleAction(viewingItem.data._id, 'rejected', rejectReason);
                      else handleTopicAction(viewingItem.data._id, 'rejected', rejectReason);
                      setRejectingId(null);
                      setRejectReason('');
                    }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors cursor-pointer shadow-sm">Kirim Penolakan</button>
                 </div>
              </div>
            ) : (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button onClick={() => { setViewingItem(null); setRejectingId(null); setRejectReason(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors cursor-pointer">
                  Tutup
                </button>
                <button onClick={() => { setRejectingId(viewingItem.data._id); setRejectReason(''); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                  ✕ Reject
                </button>
                <button onClick={() => { 
                    if (viewingItem.type === 'review') handleReviewAction(viewingItem.data._id, 'approved');
                    else if (viewingItem.type === 'article') handleArticleAction(viewingItem.data._id, 'approved');
                    else handleTopicAction(viewingItem.data._id, 'approved');
                    setViewingItem(null);
                  }} className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 border border-emerald-600 rounded-xl hover:bg-emerald-600 transition-colors cursor-pointer shadow-sm">
                  ✓ Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
