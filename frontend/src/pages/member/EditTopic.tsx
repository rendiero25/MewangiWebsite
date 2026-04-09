import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Category {
  _id: string;
  name: string;
}

export default function EditTopic() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [prefix, setPrefix] = useState('');
  const [type, setType] = useState('normal');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [loadingCats, setLoadingCats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchTopic = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/forum/edit/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTitle(data.title || '');
      setCategory(typeof data.category === 'object' ? data.category._id : data.category || '');
      setContent(data.content || '');
      setTags(data.tags ? data.tags.join(', ') : '');
      setPrefix(data.prefix || '');
      setType(data.type || 'normal');
      if (data.image) {
        setImagePreview(data.image.startsWith('http') ? data.image : `${API_URL.replace(/\/api$/, '').replace(/\/api\/$/, '')}${data.image.startsWith('/') ? data.image : `/${data.image}`}`);
      }
      setStatus(data.status || '');
      setRejectionReason(data.rejectionReason || '');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal memuat topik.';
      setError(msg || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.token]);

  useEffect(() => {
    fetchCategories();
    if (user?.token && id) fetchTopic();
  }, [fetchTopic, user?.token, id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('prefix', prefix);
      formData.append('type', type);
      formData.append('status', asDraft ? 'draft' : 'pending');
      
      if (tags.trim()) {
        tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => formData.append('tags', t));
      }
      
      if (image) formData.append('image', image);

      await axios.put(
        `${API_URL}/forum/${id}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          } 
        }
      );
      toast.success(asDraft ? 'Draft berhasil diperbarui!' : 'Topik berhasil dikirim ulang!');
      navigate('/dashboard?tab=forum');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal memperbarui topik.';
      setError(msg || 'Gagal memperbarui topik.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </Link>

        {status === 'rejected' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4 text-red-800">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Topik Ditolak Admin</h3>
                <div className="text-sm opacity-90 leading-relaxed bg-white border border-red-100 rounded-xl p-3 mt-2">
                  <span className="font-semibold block mb-1">Catatan Revisi:</span>
                  {rejectionReason || 'Tidak ada alasan spesifik.'}
                </div>
                <p className="text-xs font-medium mt-3 text-red-700/80">
                  Silakan perbaiki tulisan Anda sesuai catatan di atas, kemudian klik "Simpan Revisi" di bawah untuk diperiksa kembali.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Topik</h1>
              <p className="text-sm text-gray-500 mt-1">Perbarui detail diskusi Anda.</p>
            </div>
            {status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-xl uppercase tracking-wider">Menunggu Info</span>}
            {status === 'draft' && <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl uppercase tracking-wider">Draft Disimpan</span>}
            {status === 'approved' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl uppercase tracking-wider">Approved</span>}
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image upload */}
              <div className="lg:col-span-1">
                <p className="text-sm font-semibold text-gray-700 mb-2">Cover Topik (Opsional)</p>
                <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden group">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-4">
                        <p className="text-white text-xs font-medium">Klik untuk ganti cover</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-3 text-primary group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Ganti Cover</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="topic-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Judul Topik
                  </label>
                  <input
                    id="topic-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tulis judul yang jelas dan menarik..."
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/200</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Prefix
                    </label>
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Tanpa Prefix</option>
                      <option value="[QUESTION]">❓ [QUESTION]</option>
                      <option value="[SOLVED]">✅ [SOLVED]</option>
                      <option value="[TUTORIAL]">📖 [TUTORIAL]</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="topic-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Kategori
                    </label>
                    <select
                      id="topic-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loadingCats}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {loadingCats ? (
                        <option>Memuat kategori...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tags (pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="parfum, fragrance, tips"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tipe Thread
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="question">Question</option>
                      <option value="poll">Poll</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="topic-content" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konten
              </label>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Tulis isi diskusi kamu di sini..."
                  className="h-64 mb-12 sm:mb-10 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 w-full mt-auto">
              <Link
                to="/dashboard"
                className="mr-auto px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                Simpan Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Mengirim...' : status === 'draft' ? 'Kirim Topik' : 'Simpan Revisi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
