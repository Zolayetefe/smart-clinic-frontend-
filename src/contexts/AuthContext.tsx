import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { UserType } from '../types';

// Define response types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthResponse {
  user: UserType;
}

interface LoginError {
  message: string;
  status?: number;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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
  
  // Optional department field
  department?: string;
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
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

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
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // The response contains user object directly
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        const loginError: LoginError = {
          message: axiosError.response?.data?.message || 'Login failed',
          status: axiosError.response?.status,
        };

        switch (axiosError.response?.status) {
          case 400:
            loginError.message = 'Invalid input data';
            break;
          case 401:
            loginError.message = 'Invalid email or password';
            break;
          case 429:
            loginError.message = 'Too many login attempts. Please try again later';
            break;
          case 500:
            loginError.message = 'Server error. Please try again later';
            break;
        }
        throw loginError;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/patient/register', userData);

      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        throw new Error(axiosError.response?.data?.message || 'Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/auth/logout');
      
      if (response.data.success) {
        setUser(null);
      } else {
        throw new Error(response.data.message || 'Logout faiA led');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        throw new Error(axiosError.response?.data?.message || 'Logout failed');
      }
      throw error;
    }
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