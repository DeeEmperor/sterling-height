/**
 * Unit Service
 * Handles unit/property and estate dues operations
 * Structured for easy replacement with real API
 */
import { Unit, EstateDue } from '../types';
import { getUnitByResidentId, getDuesByUnitId, getUnitById } from '../data/mockUnits';

// Simulated delay for API calls
const API_DELAY = 500;

/**
 * Get unit for a resident
 */
export const getUnitForResident = async (residentId: string): Promise<Unit | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getUnitByResidentId(residentId) || null);
    }, API_DELAY);
  });
};

/**
 * Get unit by ID
 */
export const getUnit = async (unitId: string): Promise<Unit | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getUnitById(unitId) || null);
    }, API_DELAY / 2);
  });
};

/**
 * Get estate dues for a unit
 */
export const getEstateDues = async (unitId: string): Promise<EstateDue[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dues = getDuesByUnitId(unitId);
      // Sort by due date
      dues.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      resolve(dues);
    }, API_DELAY);
  });
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
  return new Promise((resolve) => {
    setTimeout(() => {
      const dues = getDuesByUnitId(unitId);
      const overdueCount = dues.filter(d => d.status === 'overdue').length;
      resolve(overdueCount);
    }, API_DELAY / 2);
  });
};

export default {
  getUnitForResident,
  getUnit,
  getEstateDues,
  getDaysUntilRentExpiry,
  isRentExpiringSoon,
  getOverdueDuesCount,
};
