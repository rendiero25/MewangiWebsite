import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const categories = ['Diskusi Umum', 'Rekomendasi', 'Jual Beli', 'Clone & Inspired', 'Tips & Trik', 'Lainnya'];

export default function EditTopic() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Diskusi Umum');
  const [content, setContent] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTopic = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/forum/edit/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTitle(data.title);
      setCategory(data.category);
      setContent(data.content);
      if (data.status === 'rejected' && data.rejectionReason) {
        setRejectionReason(data.rejectionReason);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal memuat topik.';
      setError(msg || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.token]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.put(
        `${API_URL}/forum/${id}`,
        { title, content, category },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal mengupdate topik.';
      setError(msg || 'Gagal mengupdate topik.');
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </Link>

        {rejectionReason && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4 text-red-800">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Topik Ditolak Admin</h3>
                <p className="text-sm opacity-90 leading-relaxed bg-white border border-red-100 rounded-xl p-3 mt-2">
                  <span className="font-semibold block mb-1">Catatan Revisi:</span>
                  {rejectionReason}
                </p>
                <p className="text-xs font-medium mt-3 text-red-700/80">
                  Perbaiki tulisan Anda sesuai catatan di atas, kemudian klik "Simpan Revisi" di bawah untuk diperiksa kembali.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Edit Topik</h1>
            <p className="text-sm text-gray-500 mt-1">Perbarui detail diskusi Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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
              <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="topic-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kategori
              </label>
              <select
                id="topic-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Revisi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
