import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{value}/5</span>
    </div>
  );
}

interface ReviewData {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  rating: { longevity: number; sillage: number; valueForMoney: number; overall: number };
  occasion: string[];
  season: string[];
  image?: string;
  status: string;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
}

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [review, setReview] = useState<ReviewData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReview = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/reviews/${id}`);
      setReview(data.review);
      setComments(data.comments);
    } catch {
      setError('Review tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/reviews/${id}/comments`,
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

  const handleDeleteReview = async () => {
    if (!confirm('Hapus review ini?')) return;
    try {
      await axios.delete(`${API_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate('/review');
    } catch {
      setError('Gagal menghapus review.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/review" className="text-primary font-medium hover:underline">← Kembali ke Review</Link>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const isOwner = user && user._id === review.author._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/review" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Review
        </Link>

        {/* Review content */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header image */}
          {review.image && (
            <div className="h-56 sm:h-72 bg-gray-100">
              <img src={review.image} alt={review.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">


            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {review.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {review.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{review.author.username}</p>
                <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="p-6 sm:p-8 bg-amber-50/50 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Rating</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StarRow label="Longevity" value={review.rating.longevity} />
              <StarRow label="Sillage" value={review.rating.sillage} />
              <StarRow label="Value" value={review.rating.valueForMoney} />
              <StarRow label="Overall" value={review.rating.overall} />
            </div>
          </div>

          {/* Tags */}
          {(review.occasion.length > 0 || review.season.length > 0) && (
            <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex flex-wrap gap-2">
              {review.occasion.map((o) => (
                <span key={o} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">{o}</span>
              ))}
              {review.season.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">{s}</span>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {review.content}
            </div>
          </div>

          {/* Actions bar */}
          {(isOwner || isAdmin) && (
            <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={handleDeleteReview}
                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Hapus Review
              </button>
            </div>
          )}
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
          {user ? (
            <form onSubmit={handleAddComment} className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tulis Komentar
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Tulis komentarmu di sini..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none transition-all"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-center py-6 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link> untuk berkomentar.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
