import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { UserType, AuthResponse } from '../types';
import { disconnectSocket } from '../utils/socket';

// Define response types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginError {
  message: string;
  status?: number;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserType>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Add interface for register data
interface RegisterData {
  // Basic user info
  name: string;
  email: string;
  password: string;
  role: string;
  
  // Personal information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  
  // Contact information
  address: string;
  emergencyContact: string;
  
  // Optional fields
  department?: string;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get<ApiResponse<AuthResponse>>('/auth/me');
        if (response.data.success && response.data.data) {
          setUser(response.data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
    setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<UserType> => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || 'Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: any): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error('Registration failed: No user data received');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || 'Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    disconnectSocket();
  };

  // Add response interceptor for handling token expiration
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401 && user) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;