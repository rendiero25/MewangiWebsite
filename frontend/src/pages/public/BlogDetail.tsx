import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";

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
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { setBreadcrumbTitle } = useBreadcrumbs();
  const location = useLocation();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/articles/${slug}`);
      // The backend returns { ...article, comments }
      setArticle(data);
      setComments(data.comments || []);
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
      const { data } = await axios.post(
        `${API_URL}/articles/${article?._id}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      setComments((prev) => [...prev, data]);
      setCommentText("");
    } catch {
      setError("Gagal mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Memuat Artikel...</p>
        </div>
      </div>
    );

  if (error || !article)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <p className="text-gray-900 font-bold mb-2">
            {error || "Artikel tidak ditemukan"}
          </p>
          <Link to="/blog" className="text-primary font-bold hover:underline">
            Kembali ke Blog
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
              ← Kembali ke Blog
            </Link> */}

            <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header: 1 Row Layout */}
              <div className="p-6 sm:p-10 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Image Left */}
                  {article.coverImage && (
                    <div className="w-full md:w-2/5 aspect-4/3 rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={
                          article.coverImage.startsWith("http")
                            ? article.coverImage
                            : `${API_URL.replace("/api", "")}${article.coverImage}`
                        }
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                      />
                    </div>
                  )}

                  {/* Data Right */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}
                      >
                        {article.category}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                      {article.title}
                    </h1>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
                      <Avatar
                        src={article.author.avatar}
                        size="lg"
                        alt={article.author.username}
                        username={article.author.username}
                      />
                      <div>
                        <Link
                          to={`/profile/${article.author.username}`}
                          className="text-sm font-bold text-gray-900 hover:text-primary transition-colors block"
                        >
                          {article.author.username}
                        </Link>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                          Penulis •{" "}
                          {new Date(article.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Below */}
              <div className="p-6 sm:p-10">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed ql-editor"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Actions */}
              <div className="px-10 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    📅 {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {comments.length} Komentar
                  </span>
                </div>
                {(isOwner || isAdmin) && (
                  <div className="flex gap-4">
                    {isOwner && (
                      <Link
                        to={`/blog/edit/${article._id}`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Edit Artikel
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>

            {/* Comments Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 px-2 flex items-center gap-3">
                Diskusi Komunitas
                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {comments.length}
                </span>
              </h2>

              <div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <p className="font-bold">Belum ada diskusi.</p>
                    <p className="text-xs">
                      Jadilah yang pertama untuk memberikan komentar!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex gap-4 items-start group"
                      >
                        <Avatar
                          src={comment.author.avatar}
                          size="md"
                          alt={comment.author.username}
                          username={comment.author.username}
                        />
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 transition-colors group-hover:bg-gray-100/80">
                          <div className="flex justify-between items-center mb-2">
                            <Link
                              to={`/profile/${comment.author.username}`}
                              className="text-xs font-bold text-gray-900 hover:text-primary transition-colors"
                            >
                              {comment.author.username}
                            </Link>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              {user ? (
                <form
                  onSubmit={handleAddComment}
                  className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Tambahkan Komentar
                  </h3>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis pendapat Anda di sini..."
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                    rows={3}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !commentText.trim()}
                      className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none cursor-pointer"
                    >
                      {submitting ? "Mengirim..." : "Kirim Komentar"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 bg-primary rounded-3xl text-center shadow-xl shadow-primary/20">
                  <p className="text-white font-bold mb-4">
                    Ingin bergabung dalam diskusi?
                  </p>
                  <Link
                    to="/login"
                    className="inline-block bg-white text-primary px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Masuk Sekarang
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform hover:scale-110 duration-700" />
                <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest relative z-10">
                  Tentang Penulis
                </h3>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={article.author.avatar}
                      size="lg"
                      alt={article.author.username}
                      username={article.author.username}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {article.author.username}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        Community Member
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${article.author.username}`}
                    className="block w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase text-center tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    Lihat Profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
