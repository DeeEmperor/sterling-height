/**
 * Authentication Service
 * Handles mock authentication flow (OTP send/verify)
 * Structured for easy replacement with real API
 */
import { User } from '../types';
import { findUserByPhone } from '../data/mockUsers';

// Simulated delay for API calls
const API_DELAY = 1000;

/**
 * Simulate sending OTP to phone number
 * In production, this would call an SMS gateway
 */
export const sendOtp = async (phone: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if phone number is valid format (basic validation)
      const phoneRegex = /^(\+234|0)[0-9]{10}$/;
      const normalizedPhone = phone.replace(/\s/g, '');
      
      if (!phoneRegex.test(normalizedPhone)) {
        resolve({
          success: false,
          message: 'Invalid phone number format',
        });
        return;
      }

      // Mock OTP sent successfully
      console.log(`[Mock] OTP sent to ${phone}: 123456`);
      resolve({
        success: true,
        message: 'OTP sent successfully',
      });
    }, API_DELAY);
  });
};

/**
 * Verify OTP code
 * In development, any 6-digit code works
 */
export const verifyOtp = async (
  phone: string, 
  otp: string
): Promise<{ success: boolean; user?: User; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Basic OTP validation (must be 6 digits)
      if (!/^\d{6}$/.test(otp)) {
        resolve({
          success: false,
          message: 'Invalid OTP format. Must be 6 digits.',
        });
        return;
      }

      // Find user by phone
      const user = findUserByPhone(phone);
      
      if (!user) {
        // In a real app, you might create a new user here
        // For this mock, we require pre-existing users
        resolve({
          success: false,
          message: 'User not found. Please contact estate management.',
        });
        return;
      }

      // Mock verification success (any 6 digits work)
      resolve({
        success: true,
        user,
        message: 'Verification successful',
      });
    }, API_DELAY);
  });
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = findUserByPhone(phone);
      resolve(user || null);
    }, API_DELAY / 2);
  });
};

export default {
  sendOtp,
  verifyOtp,
  getUserByPhone,
};
