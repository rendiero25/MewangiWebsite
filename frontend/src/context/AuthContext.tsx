import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'member' | 'admin';
  avatar: string;
  isVerified: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mewangi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('mewangi_user', JSON.stringify(data));
    return data as User;
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return data.message;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mewangi_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
