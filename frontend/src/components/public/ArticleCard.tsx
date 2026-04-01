import { Link } from 'react-router-dom';
import ImageWithLazyLoad from '../common/ImageWithLazyLoad';
import Avatar from '../common/Avatar';

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    category: string;
    tags: string[];
    author: { username: string; avatar?: string };
    views: number;
    createdAt: string;
  };
}

const categoryColors: Record<string, string> = {
  'Tips & Trik': 'bg-pink-100 text-pink-700',
  'Edukasi': 'bg-indigo-100 text-indigo-700',
  'Berita': 'bg-emerald-100 text-emerald-700',
  'Interview': 'bg-amber-100 text-amber-700',
  'Event': 'bg-purple-100 text-purple-700',
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

export default function ArticleCard({ article }: ArticleCardProps) {
  const colorClass = categoryColors[article.category] || categoryColors['Lainnya'];

  return (
    <Link to={`/blog/${article.slug}`} className="block group">
      <div className="rounded-xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Cover image */}
        <div className="h-44 bg-gradient-to-br from-indigo-100 to-blue-50 overflow-hidden">
          {article.coverImage ? (
            <ImageWithLazyLoad
              src={article.coverImage.startsWith('http') ? article.coverImage : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.coverImage}`}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              placeholderClassName="h-44 w-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          {/* Category + read time */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
              {article.excerpt}
            </p>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar src={article.author?.avatar} size="xs" alt={article.author?.username} username={article.author?.username} />
              {article.author?.username ? (
                <Link to={`/profile/${article.author.username}`} className="font-medium text-gray-600 hover:text-primary transition-colors">{article.author.username}</Link>
              ) : (
                <span className="font-medium text-gray-600">User Terhapus</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span>{timeAgo(article.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
