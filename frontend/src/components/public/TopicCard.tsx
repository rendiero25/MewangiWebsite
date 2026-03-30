import { Link } from 'react-router-dom';

interface TopicCardProps {
  topic: {
    _id: string;
    title: string;
    content: string;
    category: string;
    author: { username: string; avatar?: string };
    views: number;
    replyCount: number;
    isPinned: boolean;
    isClosed: boolean;
    createdAt: string;
    lastReplyAt: string;
  };
}

const categoryColors: Record<string, string> = {
  'Diskusi Umum': 'bg-blue-100 text-blue-700',
  'Rekomendasi': 'bg-emerald-100 text-emerald-700',
  'Jual Beli': 'bg-amber-100 text-amber-700',
  'Clone & Inspired': 'bg-purple-100 text-purple-700',
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Lainnya': 'bg-gray-100 text-gray-600',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const colorClass = categoryColors[topic.category] || categoryColors['Lainnya'];

  return (
    <Link
      to={`/forum/${topic._id}`}
      className="block group"
    >
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* Author avatar */}
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {(topic.author?.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row: badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {topic.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm0 4h10l-1.5 7.5a1 1 0 01-1 .5h-5a1 1 0 01-1-.5L5 9z" />
                  </svg>
                  Pinned
                </span>
              )}
              {topic.isClosed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ditutup
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {topic.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
              {topic.title}
            </h3>

            {/* Preview */}
            {/* <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {topic.content.replace(/<[^>]*>/g, '').slice(0, 150)}
            </p> */}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <span className="font-medium text-gray-600">{topic.author?.username || 'User Terhapus'}</span>
              <span>{timeAgo(topic.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {topic.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {topic.replyCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
