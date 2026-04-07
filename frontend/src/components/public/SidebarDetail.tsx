import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface TopMember {
  _id: string;
  username: string;
  avatar?: string;
  commentCount: number;
}

interface TopCategory {
  name: string;
  count: number;
  type?: string; 
}

interface TopTopic {
  _id: string;
  title: string;
  slug: string;
  views: number;
}

interface SidebarDetailProps {
  type: 'forum' | 'blog' | 'review';
}

export default function SidebarDetail({ type }: SidebarDetailProps) {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [topTopics, setTopTopics] = useState<TopTopic[]>([]);
  const [topForumTopics, setTopForumTopics] = useState<TopTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const path = type === 'blog' ? 'articles' : (type === 'review' ? 'reviews' : type);
        const results = await Promise.allSettled([
          axios.get(`${API_URL}/users/top-members`),
          axios.get(`${API_URL}/${path}/meta/top-categories`),
          (type === 'forum' || type === 'review') ? axios.get(`${API_URL}/${path}/meta/top-titles`) : Promise.resolve({ data: [] }),
          type === 'review' ? axios.get(`${API_URL}/forum/meta/top-titles`) : Promise.resolve({ data: [] })
        ]);

        if (results[0].status === 'fulfilled') {
          const d = (results[0] as PromiseFulfilledResult<any>).value.data;
          setTopMembers(Array.isArray(d) ? d : (d.value || d.topics || []));
        }
        if (results[1].status === 'fulfilled') {
          const d = (results[1] as PromiseFulfilledResult<any>).value.data;
          setTopCategories(Array.isArray(d) ? d : (d.value || d.categories || []));
        }
        if ((type === 'forum' || type === 'review') && results[2].status === 'fulfilled') {
          const d = (results[2] as PromiseFulfilledResult<any>).value.data;
          setTopTopics(Array.isArray(d) ? d : (d.value || d.topics || d.titles || []));
        }
        if (type === 'review' && results[3].status === 'fulfilled') {
          const d = (results[3] as PromiseFulfilledResult<any>).value.data;
          setTopForumTopics(Array.isArray(d) ? d : (d.value || d.topics || d.titles || []));
        }
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
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
            <div className="h-5 bg-gray-200 rounded-xl w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2].map(j => (
                <div key={j} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sticky top-24">
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
      {topMembers.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Members
          </h3>
          <div className="space-y-4">
            {topMembers.map((member, idx) => (
              <div key={member._id} className="flex items-center justify-between">
                <Link to={`/profile/${member.username}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
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
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                  {member.commentCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {type === 'review' ? 'Top Category' : 'Top Categories'}
          </h3>
          <div className="flex flex-col gap-1.5">
            {topCategories.slice(0, 3).map(cat => (
              <Link 
                key={`${cat.name}-${cat.type}`} 
                to={type === 'review' 
                  ? `/review?${cat.type || 'occasion'}=${cat.name}`
                  : `/forum?category=${cat.name}`
                }
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">#{cat.name}</span>
                <span className="text-[10px] bg-gray-100 group-hover:bg-primary/10 text-gray-500 group-hover:text-primary font-black px-2 py-0.5 rounded-lg transition-all">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top Topics (Trending) - Only for Forum */}
      {type === 'forum' && topTopics.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50" />
          <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending {type === 'forum' ? 'Topics' : 'Reviews'}
          </h3>
          <div className="space-y-5">
            {topTopics.map((topic, idx) => (
              <Link 
                key={topic._id} 
                to={`/${type === 'forum' ? 'forum' : 'review'}/${topic.slug || topic._id}`}
                className="block group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-xl font-black text-primary group-hover:text-rose-500/20 transition-colors leading-none pt-0.5 w-6 shrink-0 italic">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {topic.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {topic.views.toLocaleString()} dilihat
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top Forum Topics - Only for Reviews (Cross-engagement) */}
      {type === 'review' && topForumTopics.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50" />
          <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-tighter">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Top Topics
          </h3>
          <div className="space-y-5">
            {topForumTopics.slice(0, 3).map((topic, idx) => (
              <Link 
                key={topic._id} 
                to={`/forum/${topic.slug || topic._id}`}
                className="block group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-xl font-black text-gray-100 group-hover:text-blue-500/20 transition-colors leading-none pt-0.5 w-6 shrink-0 italic">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {topic.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
