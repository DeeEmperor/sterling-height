/**
 * Notification Context
 * Manages in-app notifications and mock push notification simulation
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Notification, NotificationContextType, NotificationType } from '../types';
import { notificationService } from '../services';

// Default context value
const defaultContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
};

// Create context
const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial notifications
  const fetchNotifications = useCallback(async () => {
    const { notifications: fetched, unreadCount: count } = await notificationService.getNotifications();
    setNotifications(fetched);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Add notification
  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => {
    const newNotification = notificationService.addNotification(
      notification.type,
      notification.title,
      notification.message,
      notification.data as Record<string, unknown> | undefined
    );
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    notificationService.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
