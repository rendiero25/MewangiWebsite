import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MdSend, MdArrowBack, MdSearch, MdMoreVert, MdChat } from 'react-icons/md';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  user: User;
  lastMessage: Message;
  unread: boolean;
}

export default function DirectMessages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('user');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (userId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const { data } = await axios.get(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Initialize Socket
  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      newSocket.emit('setup', user._id);

      newSocket.on('new_message', (msg: Message) => {
        // If message is from the currently selected user
        if (selectedUser && (msg.sender._id === selectedUser._id || msg.recipient._id === selectedUser._id)) {
          setMessages(prev => [...prev, msg]);
        }
        // Refresh conversations list to update last message/unread
        fetchConversations();
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedUser, fetchConversations]);

  // Initial Data Fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL target user
  useEffect(() => {
    if (targetUserId && user) {
      const fetchTargetUser = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/users/profile/${targetUserId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSelectedUser(data);
          fetchMessages(data._id);
        } catch (err) {
          console.error('Failed to fetch target user:', err);
        }
      };
      fetchTargetUser();
    }
  }, [targetUserId, user, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    try {
      if (selectedUser && user) {
        const { data } = await axios.post(`${API_URL}/messages`, {
          recipientId: selectedUser?._id,
          content: newMessage
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });

        setMessages(prev => [...prev, data]);
        setNewMessage('');
        fetchConversations();
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const selectConversation = (otherUser: User) => {
    setSelectedUser(otherUser);
    fetchMessages(otherUser?._id);
    navigate(`/messages?user=${otherUser?._id}`, { replace: true });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdChat className="text-primary text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Akses Terbatas</h2>
          <p className="text-gray-500 mb-8">Silakan masuk ke akun Anda untuk menggunakan fitur pesan pribadi.</p>
          <button onClick={() => navigate('/login')} className="w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">Login Sekarang</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 lg:p-10 flex justify-end items-start relative overflow-hidden">
      {/* Background Backdrop Overlay - Satisfies the request to cover the previous page */}
      <div className="fixed inset-0 z-0 bg-gray-900/40 backdrop-blur-md transition-all duration-700"></div>
      
      {/* Animated Decorative Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-2xl h-[calc(100vh-120px)] lg:h-[700px] bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.3)] flex flex-col md:flex-row overflow-hidden border border-white/50 relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Global Close Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100 md:hidden lg:flex"
          title="Tutup Pesan"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Sidebar: Conversations List */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 bg-white`}>
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-black text-gray-900 mb-4">Pesan</h2>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari percakapan..." 
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto chat-list" ref={chatListRef}>
            {loading ? (
              <div className="p-10 text-center space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-3 bg-gray-50 rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm">Belum ada percakapan.</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.user._id}
                  onClick={() => selectConversation(conv.user)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedUser?._id === conv.user._id ? 'bg-primary/5 border-r-4 border-primary' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      {conv.user.avatar ? (
                        <img src={conv.user.avatar.startsWith('http') ? conv.user.avatar : `${API_URL.replace('/api', '')}${conv.user.avatar}`} alt={conv.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                          {conv.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {conv.unread && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-secondary border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{conv.user.username}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage.sender._id === user._id ? 'Anda: ' : ''}{conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#FDFDFD]`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-6 bg-white border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 text-gray-400 hover:text-primary transition-colors">
                    <MdArrowBack size={24} />
                  </button>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 shadow-sm">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${API_URL.replace('/api', '')}${selectedUser.avatar}`} alt={selectedUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-900">{selectedUser.username}</h3>
                    <p className="text-[10px] sm:text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"><MdMoreVert size={20} /></button>
                  <button onClick={() => setSelectedUser(null)} className="hidden md:block p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all hover:text-red-500" title="Tutup">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 flex flex-col">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <MdChat className="text-gray-200 text-4xl" />
                    </div>
                    <p className="text-gray-400 text-sm">Belum ada pesan. Sapa {selectedUser.username}!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = user && msg.sender._id === user._id;
                    const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx-1].createdAt).toDateString();
                    
                    return (
                      <div key={msg._id} className="flex flex-col">
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <span className="px-4 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                              {new Date(msg.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <span className={`text-[9px] mt-1 block text-right font-medium ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 sm:p-6 bg-white border-t border-gray-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan Anda..." 
                    className="flex-1 pl-6 pr-14 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || !user}
                    className="absolute right-2 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                  >
                    <MdSend size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <MdChat className="text-primary text-5xl opacity-40" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Halo, {user.username}!</h2>
              <p className="text-gray-400 max-w-xs mx-auto">Pilih percakapan di sebelah kiri untuk mulai mengobrol atau cari teman baru!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
