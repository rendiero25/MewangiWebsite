import { Link, useNavigate } from 'react-router-dom';
import ImageWithLazyLoad from '../common/ImageWithLazyLoad';
import Avatar from '../common/Avatar';

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
    views: number;
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
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/review/${review._id}`);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="block group cursor-pointer"
    >
      <div className="rounded-xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
        {/* Image banner */}
        {review.image && (
          <div className="h-56 bg-gray-50 overflow-hidden">
            <ImageWithLazyLoad
              src={review.image.startsWith('http') ? review.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '').replace(/\/api\/$/, '')}${review.image.startsWith('/') ? review.image : `/${review.image}`}`}
              alt={review.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              placeholderClassName="h-56 w-full"
            />
          </div>
        )}

        <div className="p-5">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-3 mb-2">
            {review.title}
          </h3>

          {/* Overall rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={review.rating.overall} />
            <span className="text-sm font-bold text-amber-500">{review.rating.overall}/5</span>
          </div>

          {/* Preview */}
          <p className="text-sm text-black line-clamp-2 mb-3">
            {review.content?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').slice(0, 120)}
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
          <div className="flex flex-col items-start gap-2 text-xs text-gray-500 pt-3 border-t border-gray-50">
            <div className='flex flex-row items-center justify-start gap-2'>
              <Avatar 
                src={review.author?.avatar} 
                size="xs" 
                alt={review.author?.username} 
                username={review.author?.username} 
                disableLink={true}
              />

              {review.author?.username ? (
                <Link 
                  to={`/profile/${review.author.username}`} 
                  className="font-medium text-gray-600 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {review.author.username}
                </Link>
              ) : (
                <span className="font-medium text-gray-600">User Terhapus</span>
              )}
            </div>

            <div className='flex flex-row items-center justify-start gap-2'>
              <span>{timeAgo(review.createdAt)}</span>

              <span className="flex items-center gap-1 ml-auto text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {review.views || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
