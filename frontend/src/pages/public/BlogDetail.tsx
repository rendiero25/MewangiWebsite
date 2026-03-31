import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';
import SidebarDetail from '../../components/public/SidebarDetail';
import Avatar from '../../components/common/Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryColors: Record<string, string> = {
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Edukasi': 'bg-indigo-100 text-indigo-700',
  'Berita': 'bg-emerald-100 text-emerald-700',
  'Interview': 'bg-amber-100 text-amber-700',
  'Event': 'bg-purple-100 text-purple-700',
  'Lainnya': 'bg-gray-100 text-gray-600',
};

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: { _id: string; username: string; avatar?: string };
  views: number;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: string;
  likes?: string[];
  dislikes?: string[];
  article?: string;
}

interface RelatedArticle {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/articles/${slug}`);
      setArticle(data);
      if (data.comments) setComments(data.comments);
      
      // Fetch related
      const relatedRes = await axios.get(`${API_URL}/articles/detail/${data._id}/related`);
      setRelatedArticles(relatedRes.data);
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
    } catch (err) {
      console.error('Failed to delete comment:', err);
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
    } catch (err) {
      console.error('Failed to delete article:', err);
      setError('Gagal menghapus artikel.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Memuat Artikel...</p>
      </div>
    </div>
  );

  if (error || !article) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <p className="text-gray-900 font-bold mb-2">{error || 'Artikel tidak ditemukan'}</p>
        <Link to="/blog" className="text-primary font-bold hover:underline">Kembali ke Blog</Link>
      </div>
    </div>
  );

  const isOwner = user && user._id === article.author._id;
  const isAdmin = user && user.role === 'admin';
  const colorClass = categoryColors[article.category] || categoryColors['Lainnya'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
              ← Kembali ke Blog
            </Link>

            <article className="bg-white rounded-xl-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              {/* Header: 1 Row Layout */}
              <div className="p-6 sm:p-10 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Image Left */}
                  {article.coverImage && (
                    <div className="w-full md:w-2/5 aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={article.coverImage.startsWith('http') ? article.coverImage : `${API_URL.replace('/api', '')}${article.coverImage}`} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" 
                      />
                    </div>
                  )}
                  
                  {/* Data Right */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                        {article.category}
                      </span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                      {article.title}
                    </h1>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100/50">
                      <Avatar src={article.author.avatar} size="lg" alt={article.author.username} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{article.author.username}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Penulis • {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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

                {article.tags.length > 0 && (
                  <div className="mt-12 flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold transition-colors hover:bg-primary/10 hover:text-primary cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
                <div className="flex gap-6">
                  <span>👁️ {article.views} pembaca</span>
                  <span>💬 {comments.length} komentar</span>
                </div>
                {(isOwner || isAdmin) && (
                  <div className="flex gap-4">
                    {isOwner && <Link to={`/blog/edit/${article._id}`} className="text-primary hover:underline">Edit Artikel</Link>}
                    <button onClick={handleDelete} className="text-red-500 hover:underline cursor-pointer">Hapus</button>
                  </div>
                )}
              </div>
            </article>

            {/* Comments Section */}
            <section className="space-y-8 mt-12">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                Diskusi & Komentar
                <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{comments.length}</span>
              </h2>

              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <p className="font-bold">Belum ada diskusi.</p>
                    <p className="text-sm">Jadilah yang pertama untuk berbagi pemikiran!</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-50">
                      {(user ? comments : comments.slice(0, 5)).map(c => (
                        <CommentItem key={c._id} comment={{...c, article: article._id}} onDelete={handleDeleteComment} />
                      ))}
                    </div>
                    {!user && comments.length > 5 && (
                      <div className="text-center py-10 bg-gray-50/50 rounded-[1.5rem] border border-dashed border-gray-200 mt-6">
                        <p className="text-sm text-gray-500 mb-4 font-medium">Hanya 5 diskusi terbaru yang ditampilkan untuk tamu.</p>
                        <Link to="/login" className="inline-block bg-primary text-white px-10 py-3 rounded-xl text-sm font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer">
                          Masuk untuk Melihat Selengkapnya
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Comment Input */}
              {user ? (
                <form onSubmit={handleAddComment} className="bg-white rounded-xl-[2rem] border border-gray-100 p-8 shadow-md">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Tambah Komentar</h3>
                  <div className="relative">
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Apa pemikiran Anda mengenai topik ini?"
                      rows={4}
                      className="w-full p-6 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm leading-relaxed"
                    />
                    <div className="absolute bottom-4 right-4">
                       <button 
                        type="submit" 
                        disabled={submitting || !commentText.trim()}
                        className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? '...' : 'Kirim Balasan'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-indigo-600 rounded-xl-[2rem] p-10 text-center text-white shadow-xl shadow-indigo-200">
                  <p className="text-lg font-bold mb-4">Ingin ikut berdiskusi?</p>
                  <Link to="/login" className="inline-block bg-white text-indigo-600 px-10 py-3 rounded-xl font-black text-sm hover:bg-gray-100 transition-colors">
                    Masuk Sekarang
                  </Link>
                </div>
              )}
            </section>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="space-y-6 pt-10">
                <h3 className="text-xl font-black text-gray-900">Pembahasan Lainnya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.map(t => (
                    <Link key={t._id} to={`/blog/${t.slug}`} className="p-6 bg-white rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">Baca Selanjutnya</p>
                      <h4 className="text-base font-bold text-gray-800 line-clamp-2 leading-snug">{t.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-tighter">Diplubish pada {new Date(t.createdAt).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
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
