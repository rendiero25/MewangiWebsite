import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiMessageSquare, FiUsers, FiThumbsUp } from 'react-icons/fi';
import SEO from '../../components/common/SEO';
import { generateOrganizationSchema } from '../../utils/seoUtils';
import LoadingSkeleton, { ListSkeleton } from '../../components/common/LoadingSkeleton';

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar?: string;
  reputation: number;
  statistics: {
    topicsCount: number;
    followersCount: number;
    totalLikes: number;
  };
  rank: number;
}

type LeaderboardType = 'reputation' | 'posts' | 'followers' | 'helpful';

/**
 * Leaderboard Page
 * Displays ranked users based on various metrics
 */
function Leaderboard() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('reputation');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/leaderboard`, {
          params: { type: leaderboardType, limit: 100 },
        });
        setLeaderboard(response.data.data);
      } catch (err) {
        setError('Gagal memuat leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType, API_URL]);

  const getTypeLabel = () => {
    switch (leaderboardType) {
      case 'reputation':
        return '⭐ Reputasi';
      case 'posts':
        return '💬 Postingan';
      case 'followers':
        return '👥 Pengikut';
      case 'helpful':
        return '👍 Membantu';
      default:
        return 'Leaderboard';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getValueByType = (user: LeaderboardUser) => {
    switch (leaderboardType) {
      case 'reputation':
        return user.reputation;
      case 'posts':
        return user.statistics?.topicsCount || 0;
      case 'followers':
        return user.statistics?.followersCount || 0;
      case 'helpful':
        return user.statistics?.totalLikes || 0;
      default:
        return user.reputation;
    }
  };

  const typeButtons: { type: LeaderboardType; icon: React.ReactNode; label: string }[] = [
    {
      type: 'reputation',
      icon: <FiTrendingUp className="w-5 h-5" />,
      label: 'Reputasi',
    },
    {
      type: 'posts',
      icon: <FiMessageSquare className="w-5 h-5" />,
      label: 'Postingan',
    },
    {
      type: 'followers',
      icon: <FiUsers className="w-5 h-5" />,
      label: 'Pengikut',
    },
    {
      type: 'helpful',
      icon: <FiThumbsUp className="w-5 h-5" />,
      label: 'Membantu',
    },
  ];

  return (
    <>
      <SEO
        title="Leaderboard"
        description="Leaderboard komunitas Mewangi Forum. Lihat pengguna dengan reputasi tertinggi, postingan terbanyak, dan yang paling membantu."
        keywords="leaderboard, ranking, reputasi, forum"
        structuredData={generateOrganizationSchema()}
      />

      <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-amber-950">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-100 mb-4">
              Leaderboard 🏆
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Pengguna paling aktif dan berpengaruh di komunitas Mewangi
            </p>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {typeButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setLeaderboardType(btn.type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  leaderboardType === btn.type
                    ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-amber-100 dark:hover:bg-gray-700 border border-amber-200 dark:border-gray-700'
                }`}
              >
                {btn.icon}
                <span className="text-xs sm:text-sm font-medium">{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <ListSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 text-red-900 dark:text-red-100">
              {error}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Belum ada pengguna dalam leaderboard
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${
                    user.rank <= 3
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 border-2 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-2xl font-bold ${getRankColor(user.rank)}`}>
                    {getRankIcon(user.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={
                        user.avatar
                          ? user.avatar.startsWith('http')
                            ? user.avatar
                            : `http://localhost:5000${user.avatar}`
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anggota sejak {new Date(user.statistics?.topicsCount ? '2024-01-01' : '2024-06-01').toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {getValueByType(user).toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {getTypeLabel()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ Tentang Leaderboard
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li>
                <strong>Reputasi:</strong> Diperoleh dari like, helpful votes, dan kontribusi berkualitas
              </li>
              <li>
                <strong>Postingan:</strong> Jumlah topik diskusi yang dibuat
              </li>
              <li>
                <strong>Pengikut:</strong> Jumlah pengguna yang mengikuti profil Anda
              </li>
              <li>
                <strong>Membantu:</strong> Jumlah like yang diterima dari posts Anda
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;
