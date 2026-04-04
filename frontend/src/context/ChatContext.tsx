import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

interface ChatUser {
  _id: string;
  username: string;
  avatar?: string;
}

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (user?: ChatUser) => void;
  closeChat: () => void;
  toggleChat: () => void;
  selectedChatUser: ChatUser | null;
  setSelectedChatUser: (user: ChatUser | null) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  conversations: any[];
  fetchConversations: () => Promise<void>;
  socket: any;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<ChatUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<any>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setConversations(data);
      const totalUnread = data.reduce((acc: number, conv: any) => acc + (conv.unread ? 1 : 0), 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();

      if (!socketRef.current) {
        const socket = io(SOCKET_URL);
        socket.emit('join', user._id);
        
        socket.on('new_message', () => {
          fetchConversations();
        });

        socketRef.current = socket;
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConversations([]);
      setUnreadCount(0);
    }

    return () => {
      // Don't disconnect here to keep connection across page navigations if component stays mounted
    };
  }, [user, fetchConversations]);

  const openChat = (user?: ChatUser) => {
    if (user) setSelectedChatUser(user);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  return (
    <ChatContext.Provider value={{ 
      isChatOpen, 
      openChat, 
      closeChat, 
      toggleChat, 
      selectedChatUser, 
      setSelectedChatUser,
      unreadCount,
      setUnreadCount,
      conversations,
      fetchConversations,
      socket: socketRef.current,
      loading
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
