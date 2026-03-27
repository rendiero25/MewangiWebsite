import { useAuth } from '../../context/AuthContext';

interface CommentItemProps {
  comment: {
    _id: string;
    content: string;
    author: { _id: string; username: string; avatar?: string };
    createdAt: string;
  };
  onDelete?: (commentId: string) => void;
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

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const isOwner = user && user._id === comment.author._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="flex gap-3 sm:gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">
          {comment.author.username.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {comment.author.username}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {(isOwner || isAdmin) && onDelete && (
          <button
            onClick={() => onDelete(comment._id)}
            className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
