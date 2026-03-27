import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['Diskusi Umum', 'Rekomendasi', 'Jual Beli', 'Clone & Inspired', 'Tips & Trik', 'Lainnya'];

export default function CreateTopic() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Diskusi Umum');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API_URL}/forum`,
        { title, content, category },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      navigate(`/forum/${data._id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal membuat topik.';
      setError(msg || 'Gagal membuat topik.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Forum
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Buat Topik Baru</h1>
            <p className="text-sm text-gray-500 mt-1">Mulai diskusi baru di forum komunitas Mewangi.</p>
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
              <textarea
                id="topic-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Tulis isi diskusi kamu di sini..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all leading-relaxed"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/forum"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Memposting...' : 'Posting Topik'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
