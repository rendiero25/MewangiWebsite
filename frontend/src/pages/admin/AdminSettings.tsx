import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface SettingsData {
  forumName: string;
  forumDescription: string;
  logo: string;
  aboutMissionImage: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    forumName: '',
    forumDescription: '',
    logo: '',
    aboutMissionImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${user?.token}`
  }), [user?.token]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/settings`, { headers });
        setSettings(res.data);
      } catch (err) {
        console.error('Gagal memuat pengaturan:', err);
        toast.error('Gagal memuat pengaturan');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user?.token, headers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('aboutMissionImage', file);
      }

      const res = await axios.put(`${API_URL}/admin/settings`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSettings(res.data);
      setFile(null);
      setPreview('');
      toast.success('Pengaturan berhasil disimpan');
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-bold text-gray-900 text-lg">Pengaturan Situs</h2>
        <p className="text-xs text-gray-500">Kelola informasi umum dan konten halaman About</p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Mission Section (About Page)</label>
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 group hover:border-primary/50 transition-colors">
                {preview || settings.aboutMissionImage ? (
                  <img
                    src={preview || (settings.aboutMissionImage.startsWith('http') ? settings.aboutMissionImage : `${API_URL.replace('/api', '')}${settings.aboutMissionImage}`)}
                    alt="Mission Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">Klik untuk unggah foto</p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Ubah Foto
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                Rekomendasi: Ratio 16:9, Max 5MB. Foto ini akan muncul di bagian "Misi Kami" pada halaman About.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
