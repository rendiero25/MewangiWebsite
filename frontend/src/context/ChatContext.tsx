import { createContext, useContext, useState, type ReactNode } from 'react';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<ChatUser | null>(null);

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
      setSelectedChatUser 
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
