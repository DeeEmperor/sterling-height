/**
 * Notification Service
 * Handles mock push notifications
 * Structured for easy replacement with real push notification service
 */
import { Notification, NotificationType } from '../types';

// In-memory notification storage
let notifications: Notification[] = [];

/**
 * Generate unique notification ID
 */
const generateNotificationId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Add a new notification
 */
export const addNotification = (
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Notification => {
  const notification: Notification = {
    id: generateNotificationId(),
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications = [notification, ...notifications];
  return notification;
};

/**
 * Get all notifications
 */
export const getNotifications = (): Notification[] => {
  return [...notifications];
};

/**
 * Get unread count
 */
export const getUnreadCount = (): number => {
  return notifications.filter(n => !n.read).length;
};

/**
 * Mark notification as read
 */
export const markAsRead = (id: string): void => {
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index] = { ...notifications[index], read: true };
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = (): void => {
  notifications = notifications.map(n => ({ ...n, read: true }));
};

/**
 * Clear all notifications
 */
export const clearNotifications = (): void => {
  notifications = [];
};

/**
 * Simulate visitor check-in notification
 */
export const notifyVisitorCheckIn = (visitorName: string): Notification => {
  return addNotification(
    'visitor_checkin',
    'Visitor Arrived',
    `${visitorName} has checked in at the gate.`,
    { screen: 'VisitorHistory' }
  );
};

/**
 * Simulate rent expiry notification
 */
export const notifyRentExpiry = (daysLeft: number): Notification => {
  return addNotification(
    'rent_expiry',
    'Rent Expiry Reminder',
    `Your rent expires in ${daysLeft} days. Please contact management for renewal.`,
    { screen: 'MyUnit' }
  );
};

/**
 * Simulate estate dues notification
 */
export const notifyEstateDues = (dueType: string, amount: number): Notification => {
  return addNotification(
    'estate_dues',
    'Estate Dues Reminder',
    `Your ${dueType} of ₦${amount.toLocaleString()} is due. Please make payment.`,
    { screen: 'MyUnit' }
  );
};

/**
 * Simulate new announcement notification
 */
export const notifyAnnouncement = (title: string): Notification => {
  return addNotification(
    'announcement',
    'New Announcement',
    title,
    { screen: 'Announcements' }
  );
};

// Initialize with some sample notifications
const initializeNotifications = () => {
  addNotification(
    'announcement',
    'New Announcement',
    'Water Supply Maintenance scheduled for January 10th',
    { screen: 'Announcements' }
  );
  addNotification(
    'visitor_checkin',
    'Visitor Arrived',
    'Kunle Adesanya has checked in at the gate.',
    { screen: 'VisitorHistory' }
  );
};

// Initialize on module load
initializeNotifications();

export default {
  addNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  notifyVisitorCheckIn,
  notifyRentExpiry,
  notifyEstateDues,
  notifyAnnouncement,
};
