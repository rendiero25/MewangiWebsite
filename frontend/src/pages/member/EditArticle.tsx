import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['Tips & Trik', 'Edukasi', 'Berita', 'Interview', 'Event', 'Lainnya'];

export default function EditArticle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lainnya');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/articles/edit/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setCategory(data.category || 'Lainnya');
        setTagsInput((data.tags && data.tags.join(', ')) || '');
        if (data.coverImage) {
          setImagePreview(`${API_URL.replace('/api', '')}${data.coverImage}`);
        }
        setStatus(data.status || '');
        setRejectionReason(data.rejectionReason || '');
      } catch (err) {
        console.error('Gagal mengambil data artikel', err);
        setError('Gagal memuat artikel. Mungkin sudah dihapus atau ada kesalahan pada URL.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token && id) fetchArticle();
  }, [id, user?.token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('excerpt', excerpt);
      formData.append('category', category);
      formData.append('status', asDraft ? 'draft' : 'pending');
      if (tagsInput.trim()) {
        tagsInput.split(',').map(t => t.trim()).filter(Boolean).forEach(t => formData.append('tags', t));
      }
      if (coverImage) formData.append('coverImage', coverImage);

      await axios.put(`${API_URL}/articles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal mengubah artikel.';
      setError(msg || 'Gagal mengubah artikel.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-400">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </Link>
        
        {status === 'rejected' && (
           <div className="mb-6 px-5 py-4 bg-red-50 border-l-4 border-red-500 rounded-xl-r-xl shadow-sm text-red-800">
             <div className="flex items-center gap-2 mb-1">
               <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
               <h3 className="font-bold">Artikel Ditolak Admin</h3>
             </div>
             <p className="text-sm ml-7">
               <strong>Catatan / Alasan:</strong> {rejectionReason || 'Tidak ada alasan spesifik.'}
             </p>
             <p className="text-xs text-red-600 mt-2 ml-7 italic">
               Silakan perbaiki tulisan Anda sesuai masukan admin, lalu klik 'Kirim Ulang Artikel'.
             </p>
           </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit / Revisi Artikel</h1>
              <p className="text-sm text-gray-500 mt-1">Perbarui artikel Anda. Artikel akan ditinjau kembali oleh admin.</p>
            </div>
            {status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-xl uppercase tracking-wider">Menunggu Info</span>}
            {status === 'draft' && <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl uppercase tracking-wider">Draft Disimpan</span>}
            {status === 'approved' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl uppercase tracking-wider">Approved</span>}
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 sm:p-8 space-y-6">
            {/* Cover image */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">Cover Image (opsional)</p>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-xl p-1" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-400">Klik untuk ganti cover image</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="article-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul Artikel
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tulis judul yang menarik..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="article-excerpt" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Excerpt <span className="font-normal text-gray-400">(ringkasan singkat, maks 300 karakter)</span>
              </label>
              <textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="Ringkasan singkat artikel ini..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">{excerpt.length}/300</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="article-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kategori
              </label>
              <select
                id="article-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="article-tags" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tags <span className="font-normal text-gray-400">(pisahkan dengan koma)</span>
              </label>
              <input
                id="article-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="parfum, fragrance, tips"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="article-content" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konten Artikel
              </label>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 transition-all">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Tulis artikelmu di sini..."
                  className="h-80 mb-12 sm:mb-10 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 w-full mt-auto">
              <Link to="/dashboard" className="mr-auto px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Batal
              </Link>
              <button className="cursor-pointer"
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
              >
                Simpan Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Mengirim...' : 'Kirim Ulang Artikel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
