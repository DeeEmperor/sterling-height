/**
 * Unit Service
 * Handles unit/property and estate dues operations using real API
 */
import { Unit, EstateDue } from '../types';
import apiClient from './apiClient';

/**
 * Get unit for a resident (uses /units/me)
 */
export const getUnitForResident = async (residentId: string | null): Promise<Unit | null> => {
  try {
    const response = await apiClient.get('/units/me');
    return response.data.unit || null;
  } catch (error) {
    console.error('Failed to get unit:', error);
    return null;
  }
};

/**
 * Get unit by ID (fallback to /units/me as resident can only see their own unit)
 */
export const getUnit = async (unitId: string): Promise<Unit | null> => {
  try {
    const response = await apiClient.get('/units/me');
    return response.data.unit || null;
  } catch (error) {
    console.error('Failed to get unit:', error);
    return null;
  }
};

/**
 * Get estate dues for a unit
 */
export const getEstateDues = async (unitId: string): Promise<EstateDue[]> => {
  try {
    const response = await apiClient.get(`/units/${unitId}/dues`);
    return response.data.dues || [];
  } catch (error) {
    console.error('Failed to get dues:', error);
    return [];
  }
};

/**
 * Calculate days until rent expiry
 */
export const getDaysUntilRentExpiry = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if rent is expiring soon (within 30 days)
 */
export const isRentExpiringSoon = (expiryDate: string): boolean => {
  const days = getDaysUntilRentExpiry(expiryDate);
  return days >= 0 && days <= 30;
};

/**
 * Get overdue dues count
 */
export const getOverdueDuesCount = async (unitId: string): Promise<number> => {
  try {
    const dues = await getEstateDues(unitId);
    return dues.filter(d => d.status === 'overdue').length;
  } catch (error) {
    console.error('Failed to get overdue dues count:', error);
    return 0;
  }
};

export default {
  getUnitForResident,
  getUnit,
  getEstateDues,
  getDaysUntilRentExpiry,
  isRentExpiringSoon,
  getOverdueDuesCount,
};
