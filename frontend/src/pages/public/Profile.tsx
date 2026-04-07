import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Cropper, { type Area } from 'react-easy-crop';
import { MdFacebook } from 'react-icons/md';
import { FaInstagram, FaTiktok, FaTwitter, FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);



  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    gender: '',
    birthday: '',
    location: '',
    website: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      tiktok: '',
    }
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // Cropping states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        gender: user.gender || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          facebook: user.socialLinks?.facebook || '',
          twitter: user.socialLinks?.twitter || '',
          instagram: user.socialLinks?.instagram || '',
          linkedin: user.socialLinks?.linkedin || '',
          tiktok: user.socialLinks?.tiktok || '',
        }
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar.startsWith('http') ? user.avatar : `${API_URL.replace('/api', '')}${user.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '') as keyof typeof formData.socialLinks;
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [socialKey]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = tempImage;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const { x, y, width, height } = croppedAreaPixels;
      canvas.width = 400; // Standardize avatar size
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, x, y, width, height, 0, 0, 400, 400);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsCropping(false);
          }
        }, 'image/jpeg');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);


    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'socialLinks') {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });
      if (avatar) {
        data.append('avatar', avatar);
      }

      const response = await axios.put(`${API_URL}/users/profile`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // Update context
      updateUser(response.data);
      toast.success('Profil berhasil diperbarui!');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) 
        ? err.response?.data?.message || 'Gagal memperbarui profil.' 
        : 'Terjadi kesalahan yang tidak diketahui.';
      toast.error(msg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Stats */}
          {user?.statistik && (
            <div className="bg-linear-to-r from-primary/10 to-secondary/10 px-8 py-6 border-b border-gray-100 grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-primary">{user.statistik.posts}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{user.statistik.threads}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Threads</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{user.statistik.reactions}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Reactions</p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{user.statistik.reputation}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Reputation</p>
              </div>
            </div>
          )}

          <div className="p-8 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20 text-primary text-4xl font-bold">
                        {formData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer transform transition hover:scale-110 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-4">Pilih foto terbaik untuk profil Anda.</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Kelamin</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  >
                    <option value="">Pilih</option>
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Lokasi</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Media Sosial</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <MdFacebook className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${formData.socialLinks.facebook ? 'text-[#1877F2]' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      name="social_facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="Username Facebook"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] transition-all text-xs"
                    />
                  </div>
                  <div className="relative">
                    <FaInstagram className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${formData.socialLinks.instagram ? 'text-[#E4405F]' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      name="social_instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="Username Instagram"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E4405F]/20 focus:border-[#E4405F] transition-all text-xs"
                    />
                  </div>
                  <div className="relative">
                    <FaTwitter className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${formData.socialLinks.twitter ? 'text-[#1DA1F2]' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      name="social_twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="Username Twitter"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all text-xs"
                    />
                  </div>
                  <div className="relative">
                    <FaTiktok className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${formData.socialLinks.tiktok ? 'text-black' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      name="social_tiktok"
                      value={formData.socialLinks.tiktok}
                      onChange={handleChange}
                      placeholder="Username TikTok"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-xs"
                    />
                  </div>
                  <div className="relative sm:col-span-2">
                    <FaLinkedin className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${formData.socialLinks.linkedin ? 'text-[#0A66C2]' : 'text-gray-300'}`} />
                    <input
                      type="text"
                      name="social_linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="Link Profil LinkedIn"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                />
              </div>



              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transform transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Potong Foto Profil</h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative flex-1 bg-gray-900 min-h-[400px]">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
            
            <div className="p-6 bg-white space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsCropping(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={onCropSave}
                  className="flex-2 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  Terapkan & Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );


}
