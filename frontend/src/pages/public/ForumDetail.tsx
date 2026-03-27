import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryColors: Record<string, string> = {
  'Diskusi Umum': 'bg-blue-100 text-blue-700',
  'Rekomendasi': 'bg-emerald-100 text-emerald-700',
  'Jual Beli': 'bg-amber-100 text-amber-700',
  'Clone & Inspired': 'bg-purple-100 text-purple-700',
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Lainnya': 'bg-gray-100 text-gray-600',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

interface TopicData {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: { _id: string; username: string; avatar?: string };
  views: number;
  replyCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
}

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/forum/${id}`);
      setTopic(data.topic);
      setComments(data.comments);
    } catch {
      setError('Topik tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/forum/${id}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch {
      setError('Gagal mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await axios.delete(`${API_URL}/forum/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      setError('Gagal menghapus komentar.');
    }
  };

  const handleDeleteTopic = async () => {
    if (!confirm('Hapus topik ini beserta semua komentarnya?')) return;
    try {
      await axios.delete(`${API_URL}/forum/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate('/forum');
    } catch {
      setError('Gagal menghapus topik.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/forum" className="text-primary font-medium hover:underline">
            ← Kembali ke Forum
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) return null;

  const isOwner = user && user._id === topic.author._id;
  const isAdmin = user && user.role === 'admin';
  const colorClass = categoryColors[topic.category] || categoryColors['Lainnya'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Forum
        </Link>

        {/* Topic content */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {topic.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  📌 Pinned
                </span>
              )}
              {topic.isClosed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                  🔒 Ditutup
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {topic.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {topic.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {topic.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{topic.author.username}</p>
                <p className="text-xs text-gray-400">{timeAgo(topic.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {topic.content}
            </div>
          </div>

          {/* Stats & actions bar */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {topic.views} dilihat
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {comments.length} komentar
              </span>
            </div>

            {(isOwner || isAdmin) && (
              <div className="flex items-center gap-2">
                {isOwner && (
                  <Link
                    to={`/forum/${topic._id}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </Link>
                )}
                <button
                  onClick={handleDeleteTopic}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Comments section */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Komentar ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Add comment form */}
          {user && !topic.isClosed ? (
            <form onSubmit={handleAddComment} className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tulis Komentar
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Tulis komentarmu di sini..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </div>
            </form>
          ) : !user ? (
            <div className="mt-6 text-center py-6 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link> untuk berkomentar.
              </p>
            </div>
          ) : (
            <div className="mt-6 text-center py-6 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-400">🔒 Topik ini sudah ditutup untuk komentar baru.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
