import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TopMember {
  _id: string;
  username: string;
  avatar?: string;
  commentCount: number;
}

interface TopCategory {
  name: string;
  count: number;
}

interface SidebarDetailProps {
  type: 'forum' | 'blog' | 'review';
}

export default function SidebarDetail({ type }: SidebarDetailProps) {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/users/top-members`),
          axios.get(`${API_URL}/${type === 'blog' ? 'articles' : type}/meta/top-categories`)
        ]);
        setTopMembers(membersRes.data);
        setTopCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to fetch sidebar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded-xl w-1/2 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sticky top-24">
      {/* Search Widget - Optional? */}
      {/* <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div> */}

      {/* Action Button */}
      <Link 
        to={type === 'forum' ? '/forum/new' : type === 'blog' ? '/blog/new' : '/review/new'}
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transform transition hover:-translate-y-0.5 active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {type === 'forum' ? 'Mulai Diskusi' : type === 'blog' ? 'Tulis Artikel' : 'Tulis Review'}
      </Link>

      {/* Top Members */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Top Members
        </h3>
        <div className="space-y-4">
          {topMembers.map((member, idx) => (
            <div key={member._id} className="flex items-center justify-between">
              <Link to={`/profile/${member._id}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white group-hover:ring-primary/30 transition-all">
                    {member.avatar ? (
                      <img src={member.avatar.startsWith('http') ? member.avatar : `${API_URL.replace('/api', '')}${member.avatar}`} alt={member.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {idx < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-1 ring-white">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors truncate max-w-[100px]">{member.username}</span>
              </Link>
              <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                {member.commentCount} posts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Top Categories</h3>
        <div className="space-y-2">
          {topCategories.map(cat => (
            <Link 
              key={cat.name} 
              to={`/${type}?category=${cat.name}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">#{cat.name}</span>
              <span className="text-[10px] text-gray-400">{cat.count} threads</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
