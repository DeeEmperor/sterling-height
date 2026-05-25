/**
 * Authentication Context
 * Manages user authentication state and role-based access
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthContextType } from '../types';
import { authService } from '../services';

const AUTH_STORAGE_KEY = '@sterling_height_auth';
const TOKEN_STORAGE_KEY = '@sterling_height_token';
import { DeviceEventEmitter } from 'react-native';

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout function
  const logout = useCallback(async () => {
    setUser(null);
    await saveUser(null);
    await saveToken(null);
  }, []);

  // Listen for unauthorized events globally
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('UNAUTHORIZED', () => {
      logout();
    });
    return () => subscription.remove();
  }, [logout]);

  // Load saved user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to storage
  const saveUser = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const saveToken = async (token: string | null) => {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  // Login function (initiates OTP)
  const login = useCallback(async (phone: string) => {
    const result = await authService.sendOtp(phone);
    if (!result.success) {
      throw new Error(result.message);
    }
  }, []);

  // Verify OTP and complete login
  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const result = await authService.verifyOtp(phone, otp);
    if (!result.success || !result.user || !result.token) {
      throw new Error(result.message);
    }
    
    setUser(result.user);
    await saveUser(result.user);
    await saveToken(result.token);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyOtp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
