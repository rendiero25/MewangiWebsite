import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CommentItem from '../../components/public/CommentItem';
import SidebarDetail from '../../components/public/SidebarDetail';
import Breadcrumbs from '../../components/public/Breadcrumbs';
import ReportModal from '../../components/public/ReportModal';

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
  category: { name: string; slug: string; icon?: string };
  author: { _id: string; username: string; avatar?: string };
  views: number;
  replyCount: number;
  isPinned: boolean;
  isClosed: boolean;
  isFeatured?: boolean;
  isAnnouncement?: boolean;
  likes: string[];
  dislikes: string[];
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
  quote?: {
    _id: string;
    content: string;
    author: { username: string };
  };
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
  const [quotedComment, setQuotedComment] = useState<CommentData | null>(null);
  const [topicLikes, setTopicLikes] = useState<string[]>([]);
  const [topicDislikes, setTopicDislikes] = useState<string[]>([]);
  const [reacting, setReacting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, { data: relatedData }] = await Promise.all([
        axios.get(`${API_URL}/forum/${id}`),
        axios.get(`${API_URL}/forum/${id}/related`)
      ]);
      setTopic(data.topic);
      setTopicLikes(data.topic.likes || []);
      setTopicDislikes(data.topic.dislikes || []);
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
      if (quotedComment) formData.append('quote', quotedComment._id);

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
      setQuotedComment(null);
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

  const handleLikeTopic = async () => {
    if (!user) return;
    setReacting(true);
    try {
      const { data } = await axios.post(`${API_URL}/forum/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTopicLikes(data.likes);
      setTopicDislikes(data.dislikes);
    } catch (err) {
      console.error('Failed to like topic:', err);
    } finally {
      setReacting(false);
    }
  };

  const handleDislikeTopic = async () => {
    if (!user) return;
    setReacting(true);
    try {
      const { data } = await axios.post(`${API_URL}/forum/${id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTopicLikes(data.likes);
      setTopicDislikes(data.dislikes);
    } catch (err) {
      console.error('Failed to dislike topic:', err);
    } finally {
      setReacting(false);
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
  const categorySlug = (topic.category?.slug || 'lainnya') as keyof typeof categoryColors;
  const colorClass = categoryColors[categorySlug] || categoryColors['Lainnya'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <Breadcrumbs 
              items={[
                { label: 'Forum', to: '/forum' },
                { label: topic.category?.name || 'Kategori', to: `/forum?category=${topic.category?.slug}` },
                { label: topic.title }
              ]} 
            />

            <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {topic.isAnnouncement && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold ring-1 ring-emerald-200">
                      📢 Pengumuman
                    </span>
                  )}
                  {topic.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold ring-1 ring-amber-200">
                      ⭐ Featured
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                    {topic.category?.name || 'Kategori'}
                  </span>
                  {topic.isPinned && <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">📌 Pinned</span>}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">{topic.title}</h1>

                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
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

                {/* Reaction Bar for Topic */}
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100">
                  <div className="flex items-center bg-gray-100 rounded-full px-1">
                    <button 
                      onClick={handleLikeTopic}
                      disabled={reacting || !user}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        user && topicLikes.includes(user._id) 
                          ? 'text-primary bg-primary/10 font-bold' 
                          : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                      }`}
                      title="Suka"
                    >
                      <svg className={`w-5 h-5 ${user && topicLikes.includes(user._id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.743 10 20.5 10.895 20.5 12c0 .285-.06.559-.165.81l-2.484 5.962C17.653 19.345 16.94 20 16.14 20H13M14 10V5a2 2 0 00-2-2h-3L4.444 8.222C4.153 8.514 4 8.91 4 9.322V19a2 2 0 002 2h3.585c.613 0 1.2-.243 1.633-.677L14 17" />
                      </svg>
                    </button>
                    <span className="text-sm font-bold text-gray-700 min-w-6 text-center">
                      {topicLikes.length - topicDislikes.length}
                    </span>
                    <button 
                      onClick={handleDislikeTopic}
                      disabled={reacting || !user}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        user && topicDislikes.includes(user._id) 
                          ? 'text-red-500 bg-red-100 font-bold' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Tidak Suka"
                    >
                      <svg className={`w-5 h-5 ${user && topicDislikes.includes(user._id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.257 14 3.5 13.105 3.5 12c0-.285.06-.559.165-.81l2.484-5.962C6.347 4.655 7.06 4 7.86 4H11M10 14v5a2 2 0 002 2h3l4.556-5.222C20.847 15.486 21 15.09 21 14.678V5a2 2 0 00-2-2h-3.585a2.307 2.307 0 00-1.633.677L10 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 flex gap-4 text-gray-400 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {topic.replyCount} Balasan
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {topic.views} Dilihat
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1">👁️ {topic.views} views</span>
                  <span className="flex items-center gap-1">💬 {comments.length} komentar</span>
                </div>
                <div className="flex items-center gap-3">
                  {user && !isOwner && (
                    <button 
                      onClick={() => setReportModalOpen(true)}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      🚩 Laporkan
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <div className="flex gap-2">
                      {isOwner && <Link to={`/forum/edit/${topic._id}`} className="text-xs font-medium text-gray-600 hover:text-primary">Edit</Link>}
                      <button onClick={handleDeleteTopic} className="text-xs font-medium text-red-500 cursor-pointer">Hapus</button>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <ReportModal 
              isOpen={reportModalOpen}
              onClose={() => setReportModalOpen(false)}
              targetType="Topic"
              targetId={topic._id}
            />

            {/* Chat Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Diskusi ({comments.length})</h2>
              
              <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-2">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">Belum ada diskusi. Mulai percakapan!</p>
                ) : (
                  <>
                    {(user ? comments : comments.slice(0, 5)).map(c => (
                      <CommentItem 
                        key={c._id} 
                        comment={{...c, topic: topic._id}} 
                        onDelete={handleDeleteComment} 
                        onQuote={(qc) => {
                          setQuotedComment(qc);
                          commentInputRef.current?.focus();
                          commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      />
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
                  {quotedComment && (
                    <div className="mb-3 p-3 bg-gray-50 border-l-4 border-primary rounded-r-xl flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-primary mb-1">Membalas @{quotedComment.author.username}</p>
                        <div className="text-xs text-gray-500 line-clamp-1 italic" dangerouslySetInnerHTML={{ __html: quotedComment.content }} />
                      </div>
                      <button onClick={() => setQuotedComment(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <textarea 
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={quotedComment ? `Balas @${quotedComment.author.username}...` : "Tulis balasan Anda..."}
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
