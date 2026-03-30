import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';
import SidebarDetail from '../../components/public/SidebarDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categoryColors: Record<string, string> = {
  'Diskusi Umum': 'bg-blue-100 text-blue-700',
  'Rekomendasi': 'bg-emerald-100 text-emerald-700',
  'Jual Beli': 'bg-amber-100 text-amber-700',
  'Clone & Inspired': 'bg-purple-100 text-purple-700',
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Lainnya': 'bg-gray-100 text-gray-600',
};

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
  likes?: string[];
  dislikes?: string[];
  image?: string;
  topic?: string;
}

interface RelatedTopic {
  _id: string;
  title: string;
  slug?: string;
  createdAt: string;
}

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: relatedData }] = await Promise.all([
        axios.get(`${API_URL}/forum/${id}`),
        axios.get(`${API_URL}/forum/${id}/related`)
      ]);
      setTopic(data.topic);
      setComments(data.comments);
      setRelatedTopics(relatedData);
    } catch {
      setError('Topik tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCommentImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', commentText);
      if (commentImage) formData.append('image', commentImage);

      const { data } = await axios.post(
        `${API_URL}/forum/${id}/comments`,
        formData,
        { headers: { 
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data'
        } }
      );
      setComments((prev) => [...prev, data]);
      setCommentText('');
      setCommentImage(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !topic) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <p className="text-gray-900 font-bold mb-2">{error}</p>
        <Link to="/forum" className="text-primary font-bold hover:underline">Kembali ke Forum</Link>
      </div>
    </div>
  );

  if (!topic) return null;

  const isOwner = user && user._id === topic.author._id;
  const isAdmin = user && user.role === 'admin';
  const colorClass = categoryColors[topic.category] || categoryColors['Lainnya'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-2">
              ← Kembali ke Forum
            </Link>

            <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                    {topic.category}
                  </span>
                  {topic.isPinned && <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">📌 Pinned</span>}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">{topic.title}</h1>

                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    {topic.author.avatar ? (
                      <img src={topic.author.avatar.startsWith('http') ? topic.author.avatar : `${API_URL.replace('/api', '')}${topic.author.avatar}`} alt={topic.author.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{topic.author.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{topic.author.username}</p>
                    <p className="text-xs text-gray-400">Diposting pada {new Date(topic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {showFullContent && (
                  <div className="mt-6 border-t border-gray-50 pt-6 animate-fadeIn">
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 ql-editor"
                      dangerouslySetInnerHTML={{ __html: topic.content }}
                    />
                  </div>
                )}
                
                <button 
                  onClick={() => setShowFullContent(!showFullContent)}
                  className={`mt-4 flex items-center gap-2 text-primary font-bold text-xs hover:underline cursor-pointer relative z-10 ${!showFullContent ? 'bg-primary/5 px-4 py-2 rounded-xl transition-all hover:bg-primary/10' : ''}`}
                >
                  {showFullContent ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      Sembunyikan Detail Topik
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      Lihat Detail Topik
                    </>
                  )}
                </button>
              </div>

              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1">👁️ {topic.views} views</span>
                  <span className="flex items-center gap-1">💬 {comments.length} komentar</span>
                </div>
                {(isOwner || isAdmin) && (
                  <div className="flex gap-2">
                    {isOwner && <Link to={`/forum/edit/${topic._id}`} className="text-xs font-medium text-gray-600 hover:text-primary">Edit</Link>}
                    <button onClick={handleDeleteTopic} className="text-xs font-medium text-red-500 cursor-pointer">Hapus</button>
                  </div>
                )}
              </div>
            </article>

            {/* Chat Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Diskusi ({comments.length})</h2>
              
              <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-2">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">Belum ada diskusi. Mulai percakapan!</p>
                ) : (
                  <>
                    {(user ? comments : comments.slice(0, 5)).map(c => (
                      <CommentItem key={c._id} comment={{...c, topic: topic._id}} onDelete={handleDeleteComment} />
                    ))}
                    {!user && comments.length > 5 && (
                      <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-4">
                        <p className="text-sm text-gray-500 mb-3 font-medium">Hanya 5 komentar terbaru yang ditampilkan.</p>
                        <Link to="/login" className="inline-block bg-primary text-white px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer">
                          Masuk untuk Melihat Selengkapnya
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Comment Input */}
              {user && !topic.isClosed ? (
                <form onSubmit={handleAddComment} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  {error && <p className="text-red-500 text-xs mb-3 italic">⚠️ {error}</p>}
                  <div className="relative">
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tulis balasan Anda..."
                      rows={3}
                      className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <label className="cursor-pointer p-2 text-gray-400 hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input type="file" className="hidden" accept="image/*,image/gif" ref={fileInputRef} onChange={handleFileChange} />
                      </label>
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? '...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-3 relative w-32 h-32">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                      <button onClick={() => {setCommentImage(null); setImagePreview('');}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg cursor-pointer">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="p-6 bg-gray-100 rounded-xl text-center text-sm text-gray-500 italic">
                  {topic.isClosed ? '🔒 Diskusi ini telah ditutup.' : <Link to="/login" className="text-primary font-bold">Masuk</Link>} untuk bergabung dalam diskusi.
                </div>
              )}
            </section>

            {/* Other Discussions */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 px-1">Pembahasan Lainnya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedTopics.map(t => (
                  <Link key={t._id} to={`/forum/${t._id}`} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group">
                    <p className="text-xs text-primary font-bold mb-1 opacity-60 group-hover:opacity-100 transition-opacity">Related Thread</p>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2">{t.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <SidebarDetail type="forum" />
          </div>

        </div>
      </div>
    </div>
  );
}
