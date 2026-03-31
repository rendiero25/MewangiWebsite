import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'Topic' | 'Comment' | 'Review' | 'Article' | 'User';
  targetId: string;
}

const REPORT_REASONS = [
  'Spam',
  'Pelecehan atau Kebencian',
  'Konten Seksual',
  'Informasi Palsu / Hoax',
  'Kekerasan',
  'Lainnya'
];

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Silakan login untuk melaporkan konten');
      return;
    }
    if (!reason) {
      setError('Pilih alasan pelaporan');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_URL}/reports`, {
        targetType,
        targetId,
        reason,
        description
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900">Laporkan Konten</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-gray-900">Laporan Dikirim</h3>
              <p className="text-sm text-gray-500">Terima kasih telah menjaga komunitas kami tetap sehat. Admin akan segera meninjau laporan Anda.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Kenapa Anda melaporkan ini?</label>
                <div className="grid grid-cols-1 gap-2">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        reason === r 
                          ? 'bg-primary/10 text-primary ring-2 ring-primary' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Keterangan tambahan (opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan alasan lengkapnya di sini..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">{error}</p>}

              <button
                type="submit"
                disabled={loading || !reason}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none"
              >
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
