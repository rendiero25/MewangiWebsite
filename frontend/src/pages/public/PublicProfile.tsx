import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  MdLocationOn,
  MdLanguage,
  MdCalendarToday,
  MdAccessTime,
  MdChat,
} from "react-icons/md";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import FollowButton from "../../components/public/FollowButton";
import Avatar from "../../components/common/Avatar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UserProfile {
  _id: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
  };
  statistik: {
    posts: number;
    threads: number;
    reactions: number;
    reputation: number;
  };
  followers: any[];
  following: any[];
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
  lastActive: string;
  createdAt: string;
}

interface Activity {
  _id: string;
  title: string;
  type: 'forum' | 'article' | 'review';
  url: string;
  createdAt: string;
}

const PublicProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { openChat } = useChat();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setLoadingActivities(true);
        
        const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
        
        const [profileRes, activityRes] = await Promise.all([
          axios.get(`${API_URL}/users/profile/${id}`, { headers }),
          axios.get(`${API_URL}/users/profile/${id}/activity`).catch(() => ({ data: [] }))
        ]);
        
        setProfile(profileRes.data);
        setActivities(activityRes.data);
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message
          : "Gagal memuat profil";
        setError(msg || "Gagal memuat profil");
      } finally {
        setLoading(false);
        setLoadingActivities(false);
      }
    };

    fetchProfileData();
  }, [id, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit yang lalu`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ups! Profil tidak ditemukan
        </h2>
        <p className="text-gray-500 mb-6">
          {error || "User yang Anda cari mungkin sudah tidak aktif."}
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Cover Placeholder */}
      <div className="h-48 sm:h-64 bg-linear-to-r from-primary to-secondary"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-45">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  src={profile.avatar}
                  size="full"
                  alt={profile.username}
                  className="w-32 h-32 sm:w-40 sm:h-40 shadow-lg"
                />
              </div>

              {/* Name & Basic Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  {profile.username}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500 font-medium">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-primary">
                      <MdLocationOn className="text-primary" />{" "}
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <MdLanguage /> Website
                    </a>
                  )}
                  <span className="flex items-center gap-1 text-primary">
                    <MdCalendarToday className="text-primary" /> Gabung{" "}
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pb-2">
                <FollowButton
                  targetUserId={profile._id}
                  isInitialFollowing={!!profile.isFollowing}
                  onToggle={(following: boolean) => {
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            isFollowing: following,
                            followerCount:
                              (prev.followerCount || 0) + (following ? 1 : -1),
                          }
                        : null,
                    );
                  }}
                  className="px-8! py-3! rounded-xl! text-sm!"
                />

                {user && user._id !== profile._id && (
                  <button
                    onClick={() =>
                      openChat({
                        _id: profile._id,
                        username: profile.username,
                        avatar: profile.avatar,
                      })
                    }
                    className="p-3 bg-gray-50 text-primary rounded-xl hover:bg-primary/5 transition-colors border border-gray-100 shadow-sm cursor-pointer"
                    title="Kirim Pesan"
                  >
                    <MdChat size={24} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Sidebar Info */}
              <div className="space-y-8">
                {/* Stats Card */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-black mb-6">
                    Statistik Kontribusi
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-black font-medium">Threads</span>
                      <span className="text-primary font-black">
                        {profile.statistik.threads}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black font-medium">Posts</span>
                      <span className="text-primary font-black">
                        {profile.statistik.posts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black font-medium">Reactions</span>
                      <span className="text-primary font-black">
                        {profile.statistik.reactions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm mt-4">
                      <div className="flex flex-col">
                        <span className="text-md text-black font-bold">
                          Followers
                        </span>
                        <span className="text-gray-900 font-black">
                          {profile.followerCount || 0}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-md text-black font-bold">
                          Following
                        </span>
                        <span className="text-gray-900 font-black">
                          {profile.followingCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-linear-to-br from-secondary/10 to-primary/10 p-4 rounded-xl border border-secondary/20 shadow-sm mt-4">
                      <span className="text-black font-bold">Reputasi</span>
                      <span className="text-black font-black text-xl">
                        {profile.statistik.reputation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {profile.socialLinks &&
                  Object.values(profile.socialLinks).some((v) => v) && (
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                        Social Media
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {profile.socialLinks.facebook && (
                          <a
                            href={`https://facebook.com/${profile.socialLinks.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#1877F2]/10 text-[#1877F2] rounded-xl hover:scale-110 transition-transform"
                          >
                            <FaFacebook size={20} />
                          </a>
                        )}
                        {profile.socialLinks.instagram && (
                          <a
                            href={`https://instagram.com/${profile.socialLinks.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#E4405F]/10 text-[#E4405F] rounded-xl hover:scale-110 transition-transform"
                          >
                            <FaInstagram size={20} />
                          </a>
                        )}
                        {profile.socialLinks.twitter && (
                          <a
                            href={`https://twitter.com/${profile.socialLinks.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-xl hover:scale-110 transition-transform"
                          >
                            <FaTwitter size={20} />
                          </a>
                        )}
                        {profile.socialLinks.tiktok && (
                          <a
                            href={`https://tiktok.com/@${profile.socialLinks.tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-black/10 text-black rounded-xl hover:scale-110 transition-transform"
                          >
                            <FaTiktok size={20} />
                          </a>
                        )}
                        {profile.socialLinks.linkedin && (
                          <a
                            href={profile.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl hover:scale-110 transition-transform"
                          >
                            <FaLinkedin size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                {/* Last Active */}
                <div className="flex items-center gap-2 text-md font-normal text-black pl-2">
                  <MdAccessTime /> Terakhir aktif:{" "}
                  {getTimeAgo(profile.lastActive)}
                </div>
              </div>

              {/* Main Content: Bio & Activity Feed (Placeholder) */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-xl font-bold text-black mb-4">
                    Tentang Saya
                  </h3>
                  <div className="bg-gray-50/50 rounded-xl p-8 border border-gray-50 leading-relaxed text-black font-normal">
                    {profile.bio || "User ini belum menulis bio apapun."}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-gray-900 mb-6">
                    Aktivitas Terakhir
                  </h3>
                  <div className="space-y-6">
                    {loadingActivities ? (
                      [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-6 bg-white rounded-xl border border-gray-50 shadow-sm animate-pulse"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                            <div className="h-4 bg-gray-50 rounded-full w-1/2"></div>
                          </div>
                        </div>
                      ))
                    ) : activities.length === 0 ? (
                      <div className="bg-white p-8 text-center rounded-xl border border-gray-50 shadow-sm">
                        <p className="text-gray-500 font-medium">Belum ada aktivitas yang dipublikasikan.</p>
                      </div>
                    ) : (
                      activities.map((activity) => (
                        <div key={`${activity.type}-${activity._id}`} className="flex gap-4 p-1 bg-white hover:bg-third/15 cursor-pointer transition-shadow relative overflow-hidden group">
                          {/* Left icon wrapper */}
                          <div className={`w-12 h-12 border-1 shrink-0 rounded-xl flex items-center justify-center font-bold text-xl
                            ${activity.type === 'forum' ? 'bg-sky-50 text-sky-500' :
                              activity.type === 'article' ? 'bg-indigo-50 text-indigo-500' :
                              'bg-amber-50 text-amber-500'}
                          `}>
                            {activity.type === 'forum' && '💬'}
                            {activity.type === 'article' && '📰'}
                            {activity.type === 'review' && '⭐'}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit
                                ${activity.type === 'forum' ? 'bg-sky-100 text-sky-700' :
                                  activity.type === 'article' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-amber-100 text-amber-700'}
                              `}>
                                {activity.type}
                              </span>
                              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{getTimeAgo(activity.createdAt)}</span>
                            </div>
                            <Link to={activity.url} className="text-md font-bold text-gray-900 group-hover:text-primary transition-colors block line-clamp-2">
                              {activity.title}
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
