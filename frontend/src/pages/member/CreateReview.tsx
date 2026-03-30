import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const occasions = ['Sehari-hari', 'Kantor', 'Kencan', 'Pesta', 'Olahraga', 'Formal'];
const seasons = ['Panas', 'Hujan', 'Sejuk', 'Sepanjang Tahun'];

function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button className="cursor-pointer"
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
          >
            <svg
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value) ? 'text-amber-400' : 'text-gray-200'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-500 w-8">{value}/5</span>
    </div>
  );
}

export default function CreateReview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState({ longevity: 0, sillage: 0, valueForMoney: 0, overall: 0 });
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }
    if (!image) {
      setError('Foto parfum wajib diupload.');
      return;
    }
    if (rating.longevity === 0 || rating.sillage === 0 || rating.valueForMoney === 0 || rating.overall === 0) {
      setError('Semua rating wajib diisi (minimal 1 bintang).');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('rating[longevity]', String(rating.longevity));
      formData.append('rating[sillage]', String(rating.sillage));
      formData.append('rating[valueForMoney]', String(rating.valueForMoney));
      formData.append('rating[overall]', String(rating.overall));
      selectedOccasions.forEach((o) => formData.append('occasion', o));
      selectedSeasons.forEach((s) => formData.append('season', s));
      if (image) formData.append('image', image);

      await axios.post(`${API_URL}/reviews`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Gagal membuat review.';
      setError(msg || 'Gagal membuat review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <Link to="/review" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Review
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Tulis Review Parfum</h1>
            <p className="text-sm text-gray-500 mt-1">Review kamu akan ditinjau admin sebelum dipublikasikan.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Image upload (moved to top) */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">Foto Parfum Terkait</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-all">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-xl p-1" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-400">Klik untuk upload foto</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="review-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul Review
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Contoh: "Versace Eros — King of Club Night"'
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
              />
            </div>

            {/* Ratings */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Rating</p>
              <div className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <StarInput label="Longevity" value={rating.longevity} onChange={(v) => setRating({ ...rating, longevity: v })} />
                <StarInput label="Sillage" value={rating.sillage} onChange={(v) => setRating({ ...rating, sillage: v })} />
                <StarInput label="Value" value={rating.valueForMoney} onChange={(v) => setRating({ ...rating, valueForMoney: v })} />
                <StarInput label="Overall" value={rating.overall} onChange={(v) => setRating({ ...rating, overall: v })} />
              </div>
            </div>

            {/* Occasion */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Occasion</p>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button className="cursor-pointer"
                    key={o}
                    type="button"
                    onClick={() => toggleTag(o, selectedOccasions, setSelectedOccasions)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      selectedOccasions.includes(o)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Season</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => (
                  <button className="cursor-pointer"
                    key={s}
                    type="button"
                    onClick={() => toggleTag(s, selectedSeasons, setSelectedSeasons)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      selectedSeasons.includes(s)
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="review-content" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konten Review
              </label>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-amber-200 focus-within:border-amber-400 transition-all">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Ceritakan pengalamanmu dengan parfum ini..."
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
              <Link to="/review" className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? 'Mengirim...' : 'Kirim Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
