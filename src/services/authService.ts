/**
 * Authentication Service
 * Handles authentication flow (OTP send/verify) using real API
 */
import { User } from '../types';
import apiClient from './apiClient';

/**
 * Send OTP to phone number
 */
export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP',
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (
  phone: string, 
  otp: string
): Promise<{ success: boolean; user?: User; token?: string; message: string }> => {
  try {
    const response = await apiClient.post('/auth/verify-otp', { phone, otp });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Invalid OTP',
    };
  }
};

/**
 * Get user by phone number (mock wrapper if needed somewhere, typically backend returns full user on OTP verify)
 * If we really need this, we would make a /users/me endpoint. For now, return null as we get user on verify.
 */
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  return null;
};

export default {
  sendOtp,
  verifyOtp,
  getUserByPhone,
};
