/**
 * Notification Service
 * Handles notifications using real API
 */
import { Notification, NotificationType } from '../types';
import apiClient from './apiClient';

/**
 * Get all notifications for the authenticated user
 * Returns both the list of notifications and the unread count
 */
export const getNotifications = async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
  try {
    const response = await apiClient.get('/notifications');
    return {
      notifications: response.data.notifications || [],
      unreadCount: response.data.unreadCount || 0,
    };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id: string): Promise<void> => {
  try {
    await apiClient.patch('/notifications/read', { ids: [id] });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiClient.patch('/notifications/read', { all: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

/**
 * Stub for addNotification to prevent breaking existing UI code
 * In a real app, notifications are created by the backend.
 */
export const addNotification = (
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Notification => {
  return {
    id: `temp-${Date.now()}`,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Stub for clearNotifications
 */
export const clearNotifications = (): void => {
  // Backend doesn't support deleting notifications in MVP
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  addNotification,
  clearNotifications,
};
