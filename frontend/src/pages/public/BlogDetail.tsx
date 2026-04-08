import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import CommentItem from "../../components/public/CommentItem";
import SidebarDetail from "../../components/public/SidebarDetail";
import ReportModal from "../../components/public/ReportModal";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import "react-quill-new/dist/quill.snow.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const categoryColors: Record<string, string> = {
  Berita: "bg-blue-100 text-blue-700",
  Review: "bg-emerald-100 text-emerald-700",
  Tips: "bg-amber-100 text-amber-700",
  Tutorial: "bg-purple-100 text-purple-700",
  Community: "bg-pink-100 text-pink-700",
  Lainnya: "bg-gray-100 text-gray-600",
};

interface ArticleData {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
  views?: number;
  likes: string[];
  dislikes: string[];
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBreadcrumbTitle } = useBreadcrumbs();
  const location = useLocation();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quotedComment, setQuotedComment] = useState<CommentData | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [articleLikes, setArticleLikes] = useState<string[]>([]);
  const [articleDislikes, setArticleDislikes] = useState<string[]>([]);
  const [reacting, setReacting] = useState(false);

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/articles/${slug}`);
      setArticle(data);
      setComments(data.comments || []);
      setArticleLikes(data.likes || []);
      setArticleDislikes(data.dislikes || []);
      setBreadcrumbTitle(location.pathname, data.title);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Artikel tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }, [slug, location.pathname, setBreadcrumbTitle]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const payload: { content: string; quoteId?: string } = {
        content: commentText,
      };
      if (quotedComment) payload.quoteId = quotedComment._id;

      const { data } = await axios.post(
        `${API_URL}/articles/${article?._id}/comments`,
        payload,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      setComments((prev) => [...prev, data]);
      setCommentText("");
      setQuotedComment(null);
    } catch {
      setError("Gagal mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeArticle = async () => {
    if (!user || reacting || !article) return;
    setReacting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/articles/${article._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      setArticleLikes(data.likes);
      setArticleDislikes(data.dislikes);
    } catch (err) {
      console.error("Gagal menyukai artikel:", err);
    } finally {
      setReacting(false);
    }
  };

  const handleDislikeArticle = async () => {
    if (!user || reacting || !article) return;
    setReacting(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/articles/${article._id}/dislike`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      setArticleLikes(data.likes);
      setArticleDislikes(data.dislikes);
    } catch (err) {
      console.error("Gagal tidak menyukai artikel:", err);
    } finally {
      setReacting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await axios.delete(`${API_URL}/articles/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      setError("Gagal menghapus komentar.");
    }
  };

  const handleDeleteArticle = async () => {
    if (!article || !confirm("Hapus artikel ini?")) return;
    try {
      await axios.delete(`${API_URL}/articles/${article._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate("/blog");
    } catch {
      setError("Gagal menghapus artikel.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error || !article)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl">
          <p className="text-gray-500 mb-4">
            {error || "Data tidak ditemukan"}
          </p>
          <Link to="/blog" className="text-primary font-bold hover:underline">
            ← Kembali ke Artikel
          </Link>
        </div>
      </div>
    );

  const isOwner = user && user._id === article.author._id;
  const isAdmin = user && user.role === "admin";
  const colorClass =
    categoryColors[article.category] || categoryColors["Lainnya"];

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
                  {article.coverImage && (
                    <div className="w-full md:w-[280px] shrink-0">
                      <div className="aspect-square relative overflow-hidden shadow-2xl ring-1 ring-black/5 rounded-xl">
                        <img
                          src={
                            article.coverImage.startsWith("http")
                              ? article.coverImage
                              : `${API_URL.replace(/\/api$/, "").replace(/\/api\/$/, "")}${article.coverImage.startsWith("/") ? article.coverImage : `/${article.coverImage}`}`
                          }
                          alt={article.title}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Right: Data */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 text-[10px] font-black rounded-xl ${colorClass}`}
                        >
                          {article.category}
                        </span>
                      </div>

                      <h1 className="text-3xl font-bold text-gray-900 leading-[1.3]">
                        {article.title}
                      </h1>

                      <div className="flex items-center gap-3">
                        <Avatar
                          src={article.author.avatar}
                          size="sm"
                          alt={article.author.username}
                          username={article.author.username}
                        />
                        <div className="flex flex-col">
                          <Link
                            to={`/profile/${article.author.username}`}
                            className="text-xs font-black text-gray-800 hover:text-primary transition-colors"
                          >
                            {article.author.username}
                          </Link>
                          <span className="text-[10px] text-gray-500 font-bold">
                            Penulis •{" "}
                            {new Date(article.createdAt).toLocaleDateString()}{" "}
                            {article.views !== undefined &&
                              `• ${article.views} Dilihat`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body: Full Width Content */}
              <div className="px-8 py-4 sm:px-12">
                <div
                  className="prose prose-lg max-w-none text-black leading-[1.8] ql-editor p-0!"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Actions Footer */}
              <div className="px-8 py-4 sm:px-12 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Reactions */}
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-1 group/like">
                      <button
                        onClick={handleLikeArticle}
                        disabled={reacting || !user}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          user && articleLikes.includes(user._id)
                            ? "text-primary bg-primary/10 font-bold"
                            : "text-gray-400 hover:text-primary hover:bg-primary/5"
                        }`}
                        title="Suka"
                      >
                        {user && articleLikes.includes(user._id) ? (
                          <BiSolidLike className="w-5 h-5" />
                        ) : (
                          <BiLike className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-bold min-w-4 text-center ${user && articleLikes.includes(user._id) ? "text-primary" : "text-gray-700"}`}
                      >
                        {articleLikes.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 group/dislike">
                      <button
                        onClick={handleDislikeArticle}
                        disabled={reacting || !user}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          user && articleDislikes.includes(user._id)
                            ? "text-red-500 bg-red-100 font-bold"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title="Tidak Suka"
                      >
                        {user && articleDislikes.includes(user._id) ? (
                          <BiSolidDislike className="w-5 h-5" />
                        ) : (
                          <BiDislike className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-bold min-w-4 text-center ${user && articleDislikes.includes(user._id) ? "text-red-500" : "text-gray-700"}`}
                      >
                        {articleDislikes.length}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {article.views || 0} Dilihat
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
                          to={`/blog/edit/${article._id}`}
                          className="text-xs font-bold text-gray-600 hover:text-primary transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                      <button
                        onClick={handleDeleteArticle}
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
              targetType="Article"
              targetId={article._id}
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
                        comment={{ ...c, article: article._id }}
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
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
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

                    <div className="flex items-center justify-end px-4 py-3">
                      <button
                        type="submit"
                        disabled={submitting || !commentText.trim()}
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
                  Silakan{" "}
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline"
                  >
                    Masuk
                  </Link>{" "}
                  untuk bergabung dalam diskusi ini.
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <SidebarDetail type="blog" />
          </div>
        </div>
      </div>
    </div>
  );
}
