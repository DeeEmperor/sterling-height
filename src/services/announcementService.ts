/**
 * Announcement Service
 * Handles announcement retrieval using real API
 */
import { Announcement } from '../types';
import apiClient from './apiClient';

/**
 * Get all announcements
 */
export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await apiClient.get('/announcements');
    return response.data.announcements || [];
  } catch (error) {
    console.error('Failed to get announcements:', error);
    return [];
  }
};

/**
 * Get latest announcement
 */
export const getLatest = async (): Promise<Announcement | null> => {
  try {
    const response = await apiClient.get('/announcements/latest');
    return response.data.announcement || null;
  } catch (error) {
    console.error('Failed to get latest announcement:', error);
    return null;
  }
};

/**
 * Get announcement by ID
 */
export const getById = async (id: string): Promise<Announcement | null> => {
  try {
    const announcements = await getAnnouncements();
    return announcements.find(a => a.id === id) || null;
  } catch (error) {
    console.error('Failed to get announcement by ID:', error);
    return null;
  }
};

/**
 * Get urgent announcements
 */
export const getUrgent = async (): Promise<Announcement[]> => {
  try {
    const announcements = await getAnnouncements();
    return announcements.filter(a => a.priority === 'urgent');
  } catch (error) {
    console.error('Failed to get urgent announcements:', error);
    return [];
  }
};

export default {
  getAnnouncements,
  getLatest,
  getById,
  getUrgent,
};
