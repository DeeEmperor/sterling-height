/**
 * Announcement Service
 * Handles announcement retrieval
 * Structured for easy replacement with real API
 */
import { Announcement } from '../types';
import {
  getAllAnnouncements,
  getLatestAnnouncement,
  getAnnouncementById,
  getUrgentAnnouncements,
} from '../data/mockAnnouncements';

// Simulated delay for API calls
const API_DELAY = 500;

/**
 * Get all announcements
 */
export const getAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAllAnnouncements());
    }, API_DELAY);
  });
};

/**
 * Get latest announcement
 */
export const getLatest = async (): Promise<Announcement | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getLatestAnnouncement() || null);
    }, API_DELAY / 2);
  });
};

/**
 * Get announcement by ID
 */
export const getById = async (id: string): Promise<Announcement | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAnnouncementById(id) || null);
    }, API_DELAY / 2);
  });
};

/**
 * Get urgent announcements
 */
export const getUrgent = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getUrgentAnnouncements());
    }, API_DELAY / 2);
  });
};

export default {
  getAnnouncements,
  getLatest,
  getById,
  getUrgent,
};
