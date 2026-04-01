import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MdSend, MdArrowBack, MdSearch, MdMoreVert, MdChat, MdClose } from 'react-icons/md';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

export default function ChatPopup() {
  const { user } = useAuth();
  const { isChatOpen, closeChat, selectedChatUser, setSelectedChatUser } = useChat();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

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

  // Handle selectedChatUser from context (e.g. when opening from profile)
  useEffect(() => {
    if (selectedChatUser) {
      setTargetUser(selectedChatUser);
      fetchMessages(selectedChatUser._id);
    }
  }, [selectedChatUser, fetchMessages]);

  useEffect(() => {
    if (isChatOpen && user) {
      fetchConversations();
      
      // Initialize Socket
      if (!socketRef.current) {
        const socket = io(SOCKET_URL);
        socket.emit('setup', user._id);

        socket.on('new_message', (msg: Message) => {
          // If message is from/to the currently selected user
          if (targetUser && (msg.sender._id === targetUser._id || msg.recipient._id === targetUser._id)) {
            setMessages(prev => [...prev, msg]);
          }
          fetchConversations();
        });
        
        socketRef.current = socket;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isChatOpen, user, targetUser, fetchConversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !targetUser || !user) return;

    try {
      const { data } = await axios.post(`${API_URL}/messages`, {
        recipientId: targetUser?._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      setMessages(prev => [...prev, data]);
      setNewMessage('');
      fetchConversations();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const selectConversation = (otherUser: User) => {
    setTargetUser(otherUser);
    setSelectedChatUser(otherUser);
    fetchMessages(otherUser._id);
  };

  if (!isChatOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 md:p-6 mt-16 pointer-events-none">
      
      {/* Main Floating Chat Window */}
      <div className="relative w-full max-w-5xl h-[85vh] md:h-[700px] bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex flex-col md:flex-row overflow-hidden border border-white/40 pointer-events-auto animate-in zoom-in-95 duration-500">
        
        {/* Mobile Close Button Overlay */}
        <button 
          onClick={closeChat} 
          className="absolute top-6 right-6 z-50 p-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all md:hidden cursor-pointer"
        >
          <MdClose size={24} />
        </button>

        {/* Sidebar: Conversations List */}
        <div className={`${targetUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100/50 bg-white/50`}>
          <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 font-primary">Pesan</h2>
            <div className="relative group">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari percakapan..." 
                className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50/80 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-3 bg-gray-50 rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <MdChat className="text-gray-200 text-3xl" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Belum ada percakapan.</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.user._id}
                  onClick={() => selectConversation(conv.user)}
                  className={`group flex items-center gap-4 p-4 mx-2 rounded-3xl cursor-pointer transition-all duration-300 hover:bg-gray-50/80 ${targetUser?._id === conv.user._id ? 'bg-white shadow-lg shadow-gray-100/50 scale-[1.02]' : ''}`}
                >
                  <div className="relative shrink-0">
                    <Avatar 
                      src={conv.user.avatar} 
                      size="md" 
                      alt={conv.user.username} 
                      className={`ring-2 ${targetUser?._id === conv.user._id ? 'ring-primary' : 'ring-transparent'} transition-all`} 
                    />
                    {conv.unread && <div className="absolute top-0 right-0 w-4 h-4 bg-secondary border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-sm font-bold text-gray-900 truncate font-primary">{conv.user.username}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className={`${!targetUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50/30`}>
          {targetUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-5 bg-white border-b border-gray-100/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTargetUser(null)} className="md:hidden p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
                    <MdArrowBack size={24} />
                  </button>
                  <div className="relative group">
                    <Avatar src={targetUser.avatar} size="md" alt={targetUser.username} className="ring-2 ring-primary/10 transition-all group-hover:ring-primary/30" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 font-primary leading-tight">{targetUser.username}</h3>
                    <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5">
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-2xl transition-all"><MdMoreVert size={20} /></button>
                  <button onClick={closeChat} className="hidden md:flex p-3 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all cursor-pointer" title="Tutup">
                    <MdClose size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 flex flex-col custom-scrollbar">
                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-white shadow-xl shadow-gray-100/50 rounded-full flex items-center justify-center mb-6">
                      <MdChat className="text-primary/20 text-5xl" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Mulai Obrolan</h4>
                    <p className="text-gray-400 text-sm max-w-[200px]">Belum ada pesan. Sapa {targetUser.username} untuk memulai!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = user && msg.sender._id === user._id;
                    const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx-1].createdAt).toDateString();
                    
                    return (
                      <div key={msg._id} className="flex flex-col">
                        {showDate && (
                          <div className="flex justify-center my-8">
                            <span className="px-5 py-1.5 bg-white text-gray-400 text-[10px] font-black rounded-full uppercase tracking-[0.1em] shadow-sm border border-gray-100">
                              {new Date(msg.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] md:max-w-[65%] p-5 rounded-[2rem] shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none shadow-primary/20' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                            <span className={`text-[9px] mt-2 block text-right font-black ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <div className="p-6 bg-white border-t border-gray-100/50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan Anda..." 
                    className="flex-1 pl-8 pr-16 py-5 bg-gray-50/80 border-none rounded-[1.5rem] focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || !user}
                    className="absolute right-2 p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                  >
                    <MdSend size={22} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="relative mb-12">
                <div className="w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center animate-bounce duration-1000">
                  <MdChat className="text-primary text-6xl opacity-30" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-secondary rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-6 h-1 bg-white rounded-full rotate-45 absolute"></div>
                  <div className="w-6 h-1 bg-white rounded-full -rotate-45 absolute"></div>
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 font-primary">Halo, {user.username}!</h2>
              <p className="text-gray-400 max-w-sm mx-auto text-base font-medium leading-relaxed">
                Pilih salah satu percakapan di sebelah kiri atau mulai obrolan baru untuk terhubung dengan teman-teman Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
