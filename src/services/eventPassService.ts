import { EventPass, EventPassLog } from '../types';
import apiClient from './apiClient';

/**
 * Create a new event pass
 */
export const createEventPass = async (
  eventPassData: {
    eventName: string;
    visitDate: string;
    timeWindowStart: string;
    timeWindowEnd: string;
    maxEntries: number;
  }
): Promise<{ success: boolean; eventPass?: EventPass; message: string }> => {
  try {
    const response = await apiClient.post('/event-passes', eventPassData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create event pass',
    };
  }
};

/**
 * Get event passes for a resident
 */
export const getEventPassesForResident = async (): Promise<EventPass[]> => {
  try {
    const response = await apiClient.get('/event-passes');
    return response.data.eventPasses || [];
  } catch (error) {
    console.error('Failed to get event passes:', error);
    return [];
  }
};

/**
 * Verify event pass by access code (for security)
 */
export const verifyEventPassByCode = async (
  code: string
): Promise<{ success: boolean; eventPass?: EventPass; message: string }> => {
  try {
    const response = await apiClient.get(`/event-passes/verify/${code}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      eventPass: error.response?.data?.eventPass,
      message: error.response?.data?.message || 'Failed to verify event pass',
    };
  }
};

/**
 * Check in a guest using an event pass
 */
export const checkInEventPass = async (
  eventPassId: string,
  note?: string
): Promise<{ success: boolean; eventPass?: EventPass; message: string }> => {
  try {
    const response = await apiClient.post(`/event-passes/${eventPassId}/check-in`, { note });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to check in guest',
    };
  }
};

/**
 * Get all event pass check-in logs
 */
export const getEventPassLogs = async (): Promise<EventPassLog[]> => {
  try {
    const response = await apiClient.get('/event-passes/logs');
    return response.data.logs || [];
  } catch (error) {
    console.error('Failed to get event pass logs:', error);
    return [];
  }
};

export default {
  createEventPass,
  getEventPassesForResident,
  verifyEventPassByCode,
  checkInEventPass,
  getEventPassLogs,
};
