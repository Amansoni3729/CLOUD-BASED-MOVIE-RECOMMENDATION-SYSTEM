import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { movieService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('movie_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('movie_token');
      if (token) {
        try {
          // Fetch real user data from backend if token exists
          const response = await movieService.getProfile();
          setState({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to validate token', error);
          // If token validation fails, clear it
          logout();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('movie_token', token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
    toast.success(`Welcome back, ${user.name}!`);
  };

  const logout = () => {
    localStorage.removeItem('movie_token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
