import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';
import SidebarDetail from '../../components/public/SidebarDetail';
import Avatar from '../../components/common/Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest group-hover:text-amber-600 transition-colors">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-3 h-3 ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs font-black text-gray-900 w-4">{value}</span>
      </div>
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
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
  likes?: string[];
  dislikes?: string[];
  review?: string;
}

interface RelatedReview {
  _id: string;
  title: string;
  image?: string;
  createdAt: string;
}

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [review, setReview] = useState<ReviewData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedReviews, setRelatedReviews] = useState<RelatedReview[]>([]);
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
      
      const relatedRes = await axios.get(`${API_URL}/reviews/${data.review._id}/related`);
      setRelatedReviews(relatedRes.data);
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
      await axios.delete(`${API_URL}/reviews/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      setError('Gagal menghapus komentar.');
    }
  };

  const handleDeleteReview = async () => {
    if (!review || !confirm('Hapus review ini?')) return;
    try {
      await axios.delete(`${API_URL}/reviews/${review._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate('/review');
    } catch {
      setError('Gagal menghapus review.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !review) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-xl">
        <p className="text-gray-500 mb-4">{error || 'Data tidak ditemukan'}</p>
        <Link to="/review" className="text-primary font-bold hover:underline">← Kembali ke Review</Link>
      </div>
    </div>
  );

  const isOwner = user && user._id === review.author._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            <Link to="/review" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors font-medium">
              ← Kembali ke Katalog Review
            </Link>

            <article className="bg-white rounded-xl-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              {/* Header section: Image & Data (1 Row) */}
              <div className="p-8 sm:p-12 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Left: Image */}
                  <div className="w-full md:w-[320px] shrink-0">
                    <div className="aspect-square rounded-xl-[2rem] overflow-hidden shadow-2xl shadow-gray-200 ring-1 ring-gray-100">
                      <img 
                        src={review.image?.startsWith('http') ? review.image : `${API_URL.replace('/api', '')}${review.image}`} 
                        alt={review.title} 
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                  </div>

                  {/* Right: Data */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {review.occasion.map(o => (
                          <span key={o} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-xl">{o}</span>
                        ))}
                        {review.season.map(s => (
                          <span key={s} className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-xl">{s}</span>
                        ))}
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.1]">
                        {review.title}
                      </h1>

                      <div className="flex items-center gap-3">
                        <Avatar src={review.author.avatar} size="sm" alt={review.author.username} />
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-gray-800">{review.author.username}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Contributor • {new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ratings Grid */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 p-6 bg-gray-50/80 rounded-xl border border-gray-100/50">
                      <StarRow label="Longevity" value={review.rating.longevity} />
                      <StarRow label="Sillage" value={review.rating.sillage} />
                      <StarRow label="Value" value={review.rating.valueForMoney} />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 sm:border-none sm:mt-0 sm:pt-0">
                         <span className="text-[10px] uppercase font-black text-amber-600 tracking-widest">Overall Score</span>
                         <span className="text-xl font-black text-amber-600">{review.rating.overall}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body: Full Width Content */}
              <div className="p-8 sm:p-12">
                <div 
                  className="prose prose-lg max-w-none text-gray-700 leading-[1.8] ql-editor"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </div>

              {/* Actions Footer */}
              <div className="px-12 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex gap-6 items-center">
                  <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Review Reader</span>
                  <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> {comments.length} Comments</span>
                </div>
                {(isOwner || isAdmin) && (
                  <div className="flex gap-4">
                    {isOwner && <Link to={`/review/edit/${review._id}`} className="text-primary hover:text-primary/70 transition-colors">Edit</Link>}
                    <button onClick={handleDeleteReview} className="text-red-500 hover:text-red-400 transition-colors cursor-pointer">Delete Record</button>
                  </div>
                )}
              </div>
            </article>

            {/* Discussions Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 px-4">User Discussions</h2>
              
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 font-medium">No discussions yet. Share your thoughts!</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {(user ? comments : comments.slice(0, 5)).map(c => (
                        <CommentItem key={c._id} comment={{...c, review: review._id}} onDelete={handleDeleteComment} />
                      ))}
                    </div>
                    {!user && comments.length > 5 && (
                      <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 mt-6">
                        <p className="text-xs text-gray-400 mb-4 font-black uppercase tracking-widest">Only the 5 newest reviews are visible</p>
                        <Link to="/login" className="inline-block bg-primary text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer">
                          Login to Read All Reviews
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Add Comment */}
              {user ? (
                <form onSubmit={handleAddComment} className="bg-white rounded-xl-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
                  <div className="relative">
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add to the conversation..."
                      rows={3}
                      className="w-full p-6 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm font-medium"
                    />
                    <div className="absolute bottom-4 right-4">
                      <button 
                        type="submit" 
                        disabled={submitting || !commentText.trim()}
                        className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? 'Sending...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-10 bg-amber-600 rounded-xl-[2.5rem] text-center text-white shadow-2xl shadow-amber-200">
                  <p className="font-black text-xl mb-6 uppercase tracking-widest">Join the Discussion</p>
                  <Link to="/login" className="inline-block bg-white text-amber-600 px-12 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-xl">
                    Authorized Access Only
                  </Link>
                </div>
              )}
            </section>

            {/* Related Reviews */}
            {relatedReviews.length > 0 && (
              <section className="space-y-6 pt-10">
                <h3 className="text-xl font-black text-gray-900 px-4 mb-2">Explore Related Reviews</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedReviews.map(t => (
                    <Link key={t._id} to={`/review/${t._id}`} className="group bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {t.image ? (
                          <img src={`${API_URL.replace('/api', '')}${t.image}`} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg></div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <h4 className="text-sm font-black text-gray-800 line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">{t.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-4 font-bold tracking-widest uppercase">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <SidebarDetail type="review" />
          </div>

        </div>
      </div>
    </div>
  );
}
