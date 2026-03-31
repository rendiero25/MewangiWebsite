import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FollowButtonProps {
  targetUserId: string;
  isInitialFollowing: boolean;
  onToggle?: (isFollowing: boolean) => void;
  className?: string;
}

export default function FollowButton({ targetUserId, isInitialFollowing, onToggle, className = "" }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(isInitialFollowing);
  const [loading, setLoading] = useState(false);

  // Don't show button if it's the current user
  if (user && user._id === targetUserId) return null;

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Silakan login untuk mengikuti user ini');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await axios.post(`${API_URL}/users/${targetUserId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const nextState = !isFollowing;
      setIsFollowing(nextState);
      if (onToggle) onToggle(nextState);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
        isFollowing 
          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
          : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Mengikuti
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ikuti
        </>
      )}
    </button>
  );
}
