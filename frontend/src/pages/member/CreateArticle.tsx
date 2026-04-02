import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['Tips & Trik', 'Edukasi', 'Berita', 'Interview', 'Event', 'Lainnya'];

export default function CreateArticle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lainnya');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      await axios.post(`${API_URL}/articles`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal membuat artikel.';
      setError(msg || 'Gagal membuat artikel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer bg-transparent border-0 p-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Tulis Artikel</h1>
            <p className="text-sm text-gray-500 mt-1">Artikel kamu akan ditinjau admin sebelum dipublikasikan. Atau simpan sebagai draft.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Image */}
              <div className="lg:col-span-1">
                <p className="text-sm font-semibold text-gray-700 mb-2">Cover Image (opsional)</p>
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all overflow-hidden group">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-medium">Klik untuk ganti gambar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Upload Cover</p>
                      <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WEBP</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Right Column: Fields */}
              <div className="lg:col-span-2 space-y-6">
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
                    rows={3}
                    maxLength={300}
                    placeholder="Ringkasan singkat artikel ini..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none transition-all"
                  />
                  <div className="flex justify-end mt-1">
                    <p className={`text-[10px] font-medium ${excerpt.length >= 300 ? 'text-red-500' : 'text-gray-400'}`}>
                      {excerpt.length}/300
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              </div>
            </div>

            {/* Content (Full Width Below) */}
            <div>
              <label htmlFor="article-content" className="block text-sm font-semibold text-gray-700 mb-2">
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => navigate(-1)} 
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Simpan Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Mengirim...' : 'Kirim Artikel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
