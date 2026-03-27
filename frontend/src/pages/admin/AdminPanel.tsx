import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Tab = 'overview' | 'reviews' | 'articles' | 'users';

interface Stats { totalUsers: number; totalPerfumes: number; pendingReviews: number; pendingArticles: number }
interface PendingReview { _id: string; title: string;  author: { username: string; email: string };
  rating: { overall: number }; createdAt: string }
interface PendingArticle { _id: string; title: string; category: string; author: { username: string; email: string }; createdAt: string }
interface UserData { _id: string; username: string; email: string; role: string; isVerified: boolean; createdAt: string }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, revRes, artRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/reviews/pending`, { headers }),
        axios.get(`${API_URL}/admin/articles/pending`, { headers }),
        axios.get(`${API_URL}/admin/users`, { headers }),
      ]);
      setStats(statsRes.data);
      setPendingReviews(revRes.data);
      setPendingArticles(artRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Gagal memuat data admin:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReviewAction = async (id: string, status: 'approved' | 'rejected') => {
    const rejectionReason = status === 'rejected' ? prompt('Alasan penolakan (opsional):') || '' : '';
    try {
      await axios.put(`${API_URL}/admin/reviews/${id}/status`, { status, rejectionReason }, { headers });
      setPendingReviews((prev) => prev.filter((r) => r._id !== id));
      if (stats) setStats({ ...stats, pendingReviews: stats.pendingReviews - 1 });
    } catch { alert('Gagal mengupdate review.'); }
  };

  const handleArticleAction = async (id: string, status: 'approved' | 'rejected') => {
    const rejectionReason = status === 'rejected' ? prompt('Alasan penolakan (opsional):') || '' : '';
    try {
      await axios.put(`${API_URL}/admin/articles/${id}/status`, { status, rejectionReason }, { headers });
      setPendingArticles((prev) => prev.filter((a) => a._id !== id));
      if (stats) setStats({ ...stats, pendingArticles: stats.pendingArticles - 1 });
    } catch { alert('Gagal mengupdate artikel.'); }
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

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'reviews', label: 'Review', count: pendingReviews.length },
    { key: 'articles', label: 'Artikel', count: pendingArticles.length },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Admin <span className="text-primary">Panel</span>
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'from-blue-500 to-indigo-500' },
              { label: 'Total Parfum', value: stats?.totalPerfumes, icon: '🧴', color: 'from-emerald-500 to-teal-500' },
              { label: 'Review Pending', value: stats?.pendingReviews, icon: '⏳', color: 'from-amber-500 to-orange-500' },
              { label: 'Artikel Pending', value: stats?.pendingArticles, icon: '📝', color: 'from-purple-500 to-pink-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{stat.icon}</span>
                  <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                </div>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {loading ? '—' : stat.value ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Review Menunggu Approval ({pendingReviews.length})</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : pendingReviews.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">Tidak ada review yang menunggu approval. 🎉</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingReviews.map((r) => (
                  <div key={r._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400">Review Parfum · oleh {r.author.username} · {formatDate(r.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleReviewAction(r._id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                        ✓ Approve
                      </button>
                      <button onClick={() => handleReviewAction(r._id, 'rejected')} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Artikel Menunggu Approval ({pendingArticles.length})</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : pendingArticles.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">Tidak ada artikel yang menunggu approval. 🎉</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingArticles.map((a) => (
                  <div key={a._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.category} · oleh {a.author.username} · {formatDate(a.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleArticleAction(a._id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">
                        ✓ Approve
                      </button>
                      <button onClick={() => handleArticleAction(a._id, 'rejected')} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Kelola Users ({users.length})</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">{u.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{u.username}</p>
                              <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user?._id}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-white disabled:opacity-50 cursor-pointer"
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
                          {u._id !== user?._id && u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
