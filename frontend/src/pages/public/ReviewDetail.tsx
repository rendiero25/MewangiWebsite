import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import ScrollSmoother from 'gsap/ScrollSmoother';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';
import SidebarDetail from '../../components/public/SidebarDetail';
import Avatar from '../../components/common/Avatar';
import { useBreadcrumbs } from '../../context/BreadcrumbContext';
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import 'react-quill-new/dist/quill.snow.css';
import ReportModal from "../../components/public/ReportModal";

gsap.registerPlugin(ScrollSmoother);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[10px] uppercase font-black text-black group-hover:text-amber-600 transition-colors">{label}</span>
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
  views: number;
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
}

interface RelatedReview {
  _id: string;
  title: string;
  image?: string;
  views: number;
  createdAt: string;
}

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBreadcrumbTitle } = useBreadcrumbs();
  const location = useLocation();

  const [review, setReview] = useState<ReviewData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedReviews, setRelatedReviews] = useState<RelatedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [quotedComment, setQuotedComment] = useState<CommentData | null>(null);
  const [reviewLikes, setReviewLikes] = useState<string[]>([]);
  const [reviewDislikes, setReviewDislikes] = useState<string[]>([]);
  const [reacting, setReacting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchReview = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/reviews/${id}`);
      setReview(data.review);
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setReviewLikes(data.review.likes || []);
      setReviewDislikes(data.review.dislikes || []);
      setBreadcrumbTitle(location.pathname, data.review.title);
      
      const relatedRes = await axios.get(`${API_URL}/reviews/${data.review._id}/related`);
      setRelatedReviews(Array.isArray(relatedRes.data) ? relatedRes.data : []);
    } catch {
      setError('Review tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id, location.pathname, setBreadcrumbTitle]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', commentText);
      if (commentImage) formData.append('image', commentImage);
      if (quotedComment) formData.append('quoteId', quotedComment._id);

      const { data } = await axios.post(
        `${API_URL}/reviews/${id}/comments`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      setComments((prev) => [...prev, data]);
      setCommentText('');
      setCommentImage(null);
      setImagePreview('');
      setQuotedComment(null);
    } catch {
      setError('Gagal mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
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

  const handleLikeReview = async () => {
    if (!user || reacting) return;
    setReacting(true);
    try {
      const { data } = await axios.post(`${API_URL}/reviews/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviewLikes(data.likes);
      setReviewDislikes(data.dislikes);
    } catch (err) {
      console.error("Gagal menyukai review:", err);
    } finally {
      setReacting(false);
    }
  };

  const handleDislikeReview = async () => {
    if (!user || reacting) return;
    setReacting(true);
    try {
      const { data } = await axios.post(`${API_URL}/reviews/${id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviewLikes(data.likes);
      setReviewDislikes(data.dislikes);
    } catch (err) {
      console.error("Gagal tidak menyukai review:", err);
    } finally {
      setReacting(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-5">
            <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header section: Image & Data (1 Row) */}
              <div className="px-8 py-4 sm:px-12 sm:py-8">
                <div className="flex flex-col md:flex-row gap-5 items-stretch">
                  {/* Left: Image */}
                  <div className="w-full md:w-[280px] shrink-0">
                    <div className="aspect-square relative overflow-hidden shadow-2xl ring-1 ring-black/5 rounded-xl">
                      <img 
                        src={review.image?.startsWith('http') ? review.image : `${API_URL.replace(/\/api$/, '').replace(/\/api\/$/, '')}${review.image?.startsWith('/') ? review.image : `/${review.image}`}`} 
                        alt={review.title} 
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                  </div>

                  {/* Right: Data */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(review.occasion) ? review.occasion : typeof review.occasion === 'string' ? [review.occasion] : []).map(o => (
                          <span key={o as string} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl">{o as string}</span>
                        ))}
                        {(Array.isArray(review.season) ? review.season : typeof review.season === 'string' ? [review.season] : []).map(s => (
                          <span key={s as string} className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-xl">{s as string}</span>
                        ))}
                      </div>
                      
                      <h1 className="text-3xl font-bold text-gray-900 leading-[1.3] text-center md:text-left">
                        {review.title}
                      </h1>

                      <div className="flex items-center gap-3">
                        <Avatar src={review.author.avatar} size="sm" alt={review.author.username} username={review.author.username} />
                        <div className="flex flex-col">
                           <Link to={`/profile/${review.author.username}`} className="text-xs font-black text-gray-800 hover:text-primary transition-colors">{review.author.username}</Link>
                           <span className="text-[10px] text-gray-500 font-bold">Contributor • {new Date(review.createdAt).toLocaleDateString()} • {review.views || 0} Dilihat</span>
                        </div>
                      </div>
                    </div>

                    {/* Ratings Grid */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 p-6 bg-third/25 rounded-xl border border-gray-100/50">
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
              <div className="px-8 py-4 sm:px-12">
                <div 
                  className="prose prose-lg max-w-none text-black leading-[1.8] article-body"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </div>

              {/* Actions Footer */}
              <div className="px-8 py-4 sm:px-12 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Reactions */}
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-1 group/like">
                      <button
                        onClick={handleLikeReview}
                        disabled={reacting || !user}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          user && reviewLikes.includes(user._id)
                            ? "text-primary bg-primary/10 font-bold"
                            : "text-gray-400 hover:text-primary hover:bg-primary/5"
                        }`}
                        title="Suka"
                      >
                        {user && reviewLikes.includes(user._id) ? (
                          <BiSolidLike className="w-5 h-5" />
                        ) : (
                          <BiLike className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-bold min-w-4 text-center ${user && reviewLikes.includes(user._id) ? "text-primary" : "text-gray-700"}`}
                      >
                        {reviewLikes.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 group/dislike">
                      <button
                        onClick={handleDislikeReview}
                        disabled={reacting || !user}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          user && reviewDislikes.includes(user._id)
                            ? "text-red-500 bg-red-100 font-bold"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title="Tidak Suka"
                      >
                        {user && reviewDislikes.includes(user._id) ? (
                          <BiSolidDislike className="w-5 h-5" />
                        ) : (
                          <BiDislike className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-bold min-w-4 text-center ${user && reviewDislikes.includes(user._id) ? "text-red-500" : "text-gray-700"}`}
                      >
                        {reviewDislikes.length}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-black text-xs">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {review.views || 0} Dilihat
                  </span>

                  <span className="flex items-center gap-1 text-black text-xs">
                    💬 {comments.length} komentar
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {user && !isOwner && (
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="text-xs font-bold text-black hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🚩 Laporkan
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <div className="flex gap-4">
                      {isOwner && (
                        <Link
                          to={`/review/edit/${review._id}`}
                          className="text-xs font-bold text-gray-600 hover:text-primary transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                      <button
                        onClick={handleDeleteReview}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <ReportModal
              isOpen={reportModalOpen}
              onClose={() => setReportModalOpen(false)}
              targetType="Review"
              targetId={review._id}
            />

            {/* Chat Section */}
            <section className="space-y-6 pt-5">
              <h2 className="text-xl font-bold text-black">
                Diskusi ({comments.length})
              </h2>

              <div className="bg-third/50 rounded-xl border border-gray-100 p-6 space-y-2">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">
                    Belum ada diskusi. Mulai percakapan!
                  </p>
                ) : (
                  <>
                    {(user ? comments : comments.slice(0, 5)).map((c) => (
                      <CommentItem
                        key={c._id}
                        comment={{ ...c, review: review._id }}
                        onDelete={handleDeleteComment}
                        onQuote={(qc) => {
                          setQuotedComment(qc);
                          commentInputRef.current?.focus();
                          commentInputRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }}
                      />
                    ))}
                    {!user && comments.length > 5 && (
                      <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-4">
                        <p className="text-sm text-gray-500 mb-3 font-medium">
                          Hanya 5 komentar terbaru yang ditampilkan.
                        </p>
                        <Link
                          to="/login"
                          className="inline-block bg-primary text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer"
                        >
                          Masuk untuk Melihat Selengkapnya
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Comment Input */}
              {user ? (
                <form
                  onSubmit={handleAddComment}
                  className="bg-white rounded-xl border border-gray-300 p-3"
                >
                  {error && (
                    <p className="text-red-500 text-xs mb-3 italic">
                      ⚠️ {error}
                    </p>
                  )}

                  {quotedComment && (
                    <div className="p-3 bg-gray-50 border-primary rounded-xl flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-primary mb-1">
                          Membalas @{quotedComment.author.username}
                        </p>
                        <div
                          className="text-xs text-gray-500 line-clamp-1 italic"
                          dangerouslySetInnerHTML={{
                            __html: quotedComment.content,
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setQuotedComment(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="relative rounded-xl transition-all overflow-hidden">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={
                        quotedComment
                          ? `Balas @${quotedComment.author.username}...`
                          : "Tulis balasan Anda..."
                      }
                      rows={2}
                      className="w-full p-4 bg-transparent transition-all resize-none text-sm focus:outline-none focus:ring-0"
                    />

                    {imagePreview && (
                      <div className="px-4 pb-4">
                        <div className="relative w-24 h-24 group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-xl shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCommentImage(null);
                              setImagePreview("");
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg cursor-pointer transform transition hover:scale-110"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-1">
                        <label
                          className="cursor-pointer p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Unggah Gambar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,image/gif"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none cursor-pointer"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Kirim Balasan"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-gray-100 rounded-xl text-center text-sm text-gray-500 italic">
                  Silakan {" "}
                  <Link to="/login" className="text-primary font-bold hover:underline">Masuk</Link> {" "}
                  untuk bergabung dalam diskusi ini.
                </div>
              )}
            </section>

            {/* Mobile Sidebar */}
            <div className="lg:hidden mt-8">
              <SidebarDetail type="review" />
            </div>

            {/* Related Reviews */}
            {relatedReviews.length > 0 && (
              <section className="space-y-6 pt-10">
                <h3 className="text-xl font-black text-gray-900 px-4 mb-2">Explore Related Reviews</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedReviews.map(t => (
                    <Link key={t._id} to={`/review/${t._id}`} className="group bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full">
                      <div className="aspect-16/10 overflow-hidden bg-gray-100">
                        {t.image ? (
                          <img src={t.image.startsWith('http') ? t.image : `${API_URL.replace(/\/api$/, '').replace(/\/api\/$/, '')}${t.image.startsWith('/') ? t.image : `/${t.image}`}`} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
