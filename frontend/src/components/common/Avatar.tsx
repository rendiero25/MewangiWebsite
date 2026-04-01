import React from 'react';
import { Link } from 'react-router-dom';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  username?: string;
  href?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
  '2xl': 'w-16 h-16',
  'full': 'w-full h-full',
};

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Profile', size = 'md', className = '', username, href }) => {
  const fullSrc = src 
    ? (src.startsWith('http') ? src : `${BASE_URL}${src}`)
    : null;

  const sizeClass = sizeClasses[size];
  
  const profileLink = href || (username ? `/profile/${username}` : null);

  const avatarContent = (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800 shadow-xs ${className}`}>
      {fullSrc ? (
        <img 
          src={fullSrc} 
          alt={alt} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            // If the image fails to load, replace it with the fallback SVG
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      
      {/* Fallback SVG Silhoutte - hidden by default if src exists, shown if src missing or error */}
      <svg 
        className={`w-4/5 h-4/5 text-gray-300 pointer-events-none ${fullSrc ? 'hidden' : ''}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );

  if (profileLink) {
    return <Link to={profileLink} className="no-underline hover:opacity-80 transition-opacity">{avatarContent}</Link>;
  }

  return avatarContent;
};

export default Avatar;
