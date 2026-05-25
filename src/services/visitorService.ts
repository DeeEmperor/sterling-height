/**
 * Visitor Service
 * Handles visitor management operations using real API
 */
import { Visitor, VisitorStatus } from '../types';
import apiClient from './apiClient';

/**
 * Create a new visitor
 * residentId is optional since backend uses token
 */
export const createVisitor = async (
  residentId: string | null,
  visitorData: {
    name: string;
    visitDate: string;
    timeWindowStart: string;
    timeWindowEnd: string;
    carPlateNumber?: string;
  }
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  try {
    const response = await apiClient.post('/visitors', visitorData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create visitor',
    };
  }
};

/**
 * Get visitors for a resident
 */
export const getVisitorsForResident = async (
  residentId: string | null
): Promise<Visitor[]> => {
  try {
    const response = await apiClient.get('/visitors');
    return response.data.visitors || [];
  } catch (error) {
    console.error('Failed to get visitors:', error);
    return [];
  }
};

/**
 * Verify visitor by access code (for security)
 */
export const verifyVisitorByCode = async (
  code: string
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  try {
    const response = await apiClient.get(`/visitors/verify/${code}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      visitor: error.response?.data?.visitor,
      message: error.response?.data?.message || 'Failed to verify visitor',
    };
  }
};

/**
 * Update visitor status (mark as entered/denied/exited)
 */
export const updateVisitorStatus = async (
  visitorId: string,
  status: VisitorStatus
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  try {
    const response = await apiClient.patch(`/visitors/${visitorId}/status`, { status });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update visitor status',
    };
  }
};

/**
 * Get all visitor logs (for security)
 */
export const getVisitorLogs = async (): Promise<Visitor[]> => {
  try {
    const response = await apiClient.get('/visitors/logs');
    return response.data.visitors || [];
  } catch (error) {
    console.error('Failed to get visitor logs:', error);
    return [];
  }
};

/**
 * Get today's visitor statistics
 */
export const getTodayStats = async (): Promise<{
  total: number;
  entered: number;
}> => {
  try {
    const response = await apiClient.get('/visitors/logs');
    return {
      total: response.data.stats?.todayTotal || 0,
      entered: response.data.stats?.todayEntered || 0,
    };
  } catch (error) {
    console.error('Failed to get visitor stats:', error);
    return { total: 0, entered: 0 };
  }
};

/**
 * Get upcoming visitor for resident (next pending visit)
 */
export const getUpcomingVisitor = async (
  residentId: string | null
): Promise<Visitor | null> => {
  try {
    const response = await apiClient.get('/visitors');
    const visitors: Visitor[] = response.data.visitors || [];
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = visitors.find(
      v => v.status === 'pending' && v.visitDate.split('T')[0] >= today
    );
    
    return upcoming || null;
  } catch (error) {
    console.error('Failed to get upcoming visitor:', error);
    return null;
  }
};

export default {
  createVisitor,
  getVisitorsForResident,
  verifyVisitorByCode,
  updateVisitorStatus,
  getVisitorLogs,
  getTodayStats,
  getUpcomingVisitor,
};
