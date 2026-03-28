"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const SESSION_DURATION = 30 * 60 * 1000;

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const checkSessionExpiry = () => {
    const loginTime = localStorage.getItem('auth_login_time');
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime, 10);
      if (elapsed > SESSION_DURATION) {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_login_time');
        router.push('/login?expired=true');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      if (!checkSessionExpiry()) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      checkSessionExpiry();
    }, 60 * 1000);

    const resetTimer = () => {
      localStorage.setItem('auth_login_time', Date.now().toString());
    };

    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_login_time', Date.now().toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_login_time');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout
    }}>
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
