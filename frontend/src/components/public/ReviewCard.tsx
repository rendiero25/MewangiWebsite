import { Link } from 'react-router-dom';

interface ReviewCardProps {
  review: {
    _id: string;
    title: string;
    content: string;
    author: { username: string; avatar?: string };
    rating: { longevity: number; sillage: number; valueForMoney: number; overall: number };
    occasion: string[];
    season: string[];
    image?: string;
    createdAt: string;
  };
}

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

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link to={`/review/${review._id}`} className="block group">
      <div className="rounded-xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
        {/* Image banner */}
        {review.image && (
          <div className="h-40 bg-gray-100 overflow-hidden">
            <img
              src={review.image.startsWith('http') ? review.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${review.image}`}
              alt={review.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="p-5">


          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {review.title}
          </h3>

          {/* Overall rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={review.rating.overall} />
            <span className="text-sm font-bold text-amber-500">{review.rating.overall}/5</span>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {review.content.replace(/<[^>]*>/g, '').slice(0, 120)}
          </p>

          {/* Tags */}
          {(review.occasion.length > 0 || review.season.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {review.occasion.slice(0, 2).map((o) => (
                <span key={o} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">{o}</span>
              ))}
              {review.season.slice(0, 2).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs">{s}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-50">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">
                {(review.author?.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-gray-600">{review.author?.username || 'User Terhapus'}</span>
            <span>·</span>
            <span>{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
