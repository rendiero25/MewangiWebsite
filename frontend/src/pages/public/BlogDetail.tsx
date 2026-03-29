import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryColors: Record<string, string> = {
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Edukasi': 'bg-indigo-100 text-indigo-700',
  'Berita': 'bg-emerald-100 text-emerald-700',
  'Interview': 'bg-amber-100 text-amber-700',
  'Event': 'bg-purple-100 text-purple-700',
  'Lainnya': 'bg-gray-100 text-gray-600',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: { _id: string; username: string; avatar?: string };
  views: number;
  status: string;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/articles/${slug}`);
      setArticle(data);
      if (data.comments) {
        setComments(data.comments);
      }
    } catch {
      setError('Artikel tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !article) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/articles/${article._id}/comments`,
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
      await axios.delete(`${API_URL}/articles/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      setError('Gagal menghapus komentar.');
    }
  };

  const handleDelete = async () => {
    if (!article || !confirm('Hapus artikel ini?')) return;
    try {
      await axios.delete(`${API_URL}/articles/${article._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate('/blog');
    } catch {
      setError('Gagal menghapus artikel.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-56 bg-gray-200 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/blog" className="text-indigo-600 font-medium hover:underline">← Kembali ke Blog</Link>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const isOwner = user && user._id === article.author._id;
  const isAdmin = user && user.role === 'admin';
  const colorClass = categoryColors[article.category] || categoryColors['Lainnya'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Cover image */}
      {article.coverImage && (
        <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 relative">
          <img src={article.coverImage.startsWith('http') ? article.coverImage : `${API_URL.replace('/api', '')}${article.coverImage}`} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Blog
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {article.category}
              </span>
              <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Author */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(article.author?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{article.author?.username || 'User Terhapus'}</p>
                  <p className="text-xs text-gray-400">Penulis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div 
              className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed break-words ql-editor"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Comment Section */}
        <section className="mt-12 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Komentar <span className="text-gray-400 ml-2 text-lg font-normal">({comments.length})</span>
            </h2>
          </div>

          {/* Comment List */}
          <div className="mb-10">
            {comments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.855-1.241L3 21l1.83-5.591C3.83 14.39 3 12.418 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium">Belum ada diskusi di sini</p>
                <p className="text-gray-400 text-sm mt-1 text-center">Jadilah yang pertama memberikan suara!</p>
              </div>
            ) : (
              <div className="space-y-6 bg-white rounded-2xl border border-gray-100 px-6 shadow-sm overflow-hidden">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Comment Form */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tulis Komentar</h3>
            {user ? (
              <form onSubmit={handleAddComment} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <span className="text-indigo-500 text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Apa pendapatmu tentang artikel ini?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={submitting || !commentText.trim()}
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-indigo-50 rounded-2xl text-center border border-indigo-100">
                <p className="text-indigo-900 text-sm mb-3 font-medium">Masuk untuk ikut berdiskusi</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 rounded-xl bg-white text-indigo-600 border border-indigo-200 text-sm font-semibold hover:bg-indigo-100 transition-all"
                >
                  Login Sekarang
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
