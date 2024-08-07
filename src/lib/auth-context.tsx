'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  hasToken: boolean;
  walletId: string;
  isAdmin: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// List of paths that don't require authentication
const publicPaths = ['/auth', '/forgot-password'];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async (authToken: string) => {
    try {
      const response = await apiService.getUser(authToken);
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If we fail to fetch user data, we should probably log the user out
      setToken(null);
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !token && !publicPaths.includes(pathname)) {
      router.push('/auth');
    }
  }, [token, isLoading, pathname, router]);

  const setAuthToken = async (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      await fetchUser(newToken);
    } else {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  const logout = () => {
    setAuthToken(null);
    router.push('/auth');
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken: setAuthToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useProtectedRoute = () => {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token && !publicPaths.includes(pathname)) {
      router.push('/auth');
    }
  }, [token, pathname, router]);
};