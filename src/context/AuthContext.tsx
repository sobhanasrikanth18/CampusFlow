import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface LoginCredentials {
  identifier?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; user?: User }>;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('campusflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const text = await res.text();
          let data: any = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = {};
          }
          if (res.ok && data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('campusflow_token');
            setToken(null);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        return {
          success: false,
          message: 'Backend server returned an invalid or empty response. Please verify the backend server is running (`npm run dev`).',
        };
      }

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('campusflow_token', data.token);
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || `Login failed (Status ${res.status}). Check credentials.` };
    } catch (err: any) {
      console.error('Login request failed:', err);
      return { success: false, message: err.message || 'Network error connecting to backend server.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsRole = async (role: UserRole) => {
    await login({ role });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusflow_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
