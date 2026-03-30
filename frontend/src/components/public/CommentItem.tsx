import { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CommentItemProps {
  comment: {
    _id: string;
    content: string;
    author: { _id: string; username: string; avatar?: string };
    createdAt: string;
    likes?: string[];
    dislikes?: string[];
    image?: string;
    topic?: string;
    article?: string;
    review?: string;
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
  const isMe = user && user._id === comment.author?._id;
  const isAdmin = user && user.role === 'admin';

  const [likes, setLikes] = useState<string[]>(comment.likes || []);
  const [dislikes, setDislikes] = useState<string[]>(comment.dislikes || []);
  const [isLiking, setIsLiking] = useState(false);

  const hasLiked = user && likes.includes(user._id);
  const hasDisliked = user && dislikes.includes(user._id);

  const commentType = useMemo(() => {
    if ('topic' in comment) return 'forum';
    if ('article' in comment) return 'articles';
    if ('review' in comment) return 'reviews';
    return 'forum'; // fallback
  }, [comment]);

  const handleLike = async () => {
    if (!user) return;
    setIsLiking(true);
    try {
      const { data } = await axios.post(`${API_URL}/${commentType}/comments/${comment._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLikes(data.likes);
      setDislikes(data.dislikes);
    } catch (err) {
      console.error('Failed to like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    setIsLiking(true);
    try {
      const { data } = await axios.post(`${API_URL}/${commentType}/comments/${comment._id}/dislike`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLikes(data.likes);
      setDislikes(data.dislikes);
    } catch (err) {
      console.error('Failed to dislike:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const imageUrl = comment.image && (comment.image.startsWith('http') ? comment.image : `${API_URL.replace('/api', '')}${comment.image}`);

  return (
    <div className={`flex flex-col gap-1 py-4 ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center shrink-0 mt-1">
          {comment.author?.avatar ? (
            <img 
              src={comment.author.avatar.startsWith('http') ? comment.author.avatar : `${API_URL.replace('/api', '')}${comment.author.avatar}`} 
              className="w-full h-full rounded-full object-cover" 
              alt={comment.author.username} 
            />
          ) : (
            <span className="text-white text-[10px] font-bold">
              {(comment.author?.username || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-semibold text-gray-900">
              {comment.author?.username || 'User Terhapus'}
            </span>
            <span className="text-[10px] text-gray-400">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <div className={`p-3 rounded-xl text-sm shadow-sm ${
            isMe 
              ? 'bg-primary text-white rounded-xl-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-xl-tl-none'
          }`}>
            <div 
              className={`prose prose-xs max-w-none break-words ql-editor ${isMe ? 'text-white' : 'text-gray-700'}`}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            
            {imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                <img 
                  src={imageUrl} 
                  alt="Attachment" 
                  className="max-h-60 w-auto object-contain cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
              </div>
            )}
          </div>

          {/* Actions: Like, Dislike, Delete */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
                hasLiked ? (isMe ? 'text-white' : 'text-primary') : (isMe ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-primary')
              }`}
            >
              <svg className={`w-3 h-3 ${hasLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.743 10 20.5 10.895 20.5 12c0 .285-.06.559-.165.81l-2.484 5.962C17.653 19.345 16.94 20 16.14 20H13M14 10V5a2 2 0 00-2-2h-3L4.444 8.222C4.153 8.514 4 8.91 4 9.322V19a2 2 0 002 2h3.585c.613 0 1.2-.243 1.633-.677L14 17" />
              </svg>
              {likes.length}
            </button>
            <button 
              onClick={handleDislike}
              disabled={isLiking}
              className={`flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
                hasDisliked ? (isMe ? 'text-white' : 'text-red-500') : (isMe ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500')
              }`}
            >
              <svg className={`w-3 h-3 ${hasDisliked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.257 14 3.5 13.105 3.5 12c0-.285.06-.559.165-.81l2.484-5.962C6.347 4.655 7.06 4 7.86 4H11M10 14v5a2 2 0 002 2h3l4.556-5.222C20.847 15.486 21 15.09 21 14.678V5a2 2 0 00-2-2h-3.585a2.307 2.307 0 00-1.633.677L10 7" />
              </svg>
              {dislikes.length}
            </button>
            
            {(isMe || isAdmin) && onDelete && (
              <button className="cursor-pointer"
                onClick={() => onDelete(comment._id)}
                className={`text-[10px] transition-colors cursor-pointer ${isMe ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
