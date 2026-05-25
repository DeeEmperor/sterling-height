/**
 * Type definitions for Sterling Height Estate app
 */

// User roles
export type UserRole = 'resident' | 'security';

// User model
export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  unitId?: string; // Only for residents
  createdAt: string;
}

// Unit/Property model
export interface Unit {
  id: string;
  unitNumber: string;
  residentId: string;
  residentName: string;
  ownershipType: 'owner' | 'tenant';
  rentStartDate?: string;
  rentExpiryDate?: string;
}

// Estate dues
export type DueStatus = 'paid' | 'due' | 'overdue';

export interface EstateDue {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: DueStatus;
  unitId: string;
}

// Visitor status
export type VisitorStatus = 'pending' | 'entered' | 'denied' | 'exited';

// Visitor model
export interface Visitor {
  id: string;
  name: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  visitDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  carPlateNumber?: string;
  accessCode: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
}

// Event Pass model
export interface EventPass {
  id: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  eventName: string;
  visitDate: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  maxEntries: number;
  entriesUsed: number;
  accessCode: string;
  status: 'active' | 'exhausted';
  createdAt: string;
}

// Event Pass Log model
export interface EventPassLog {
  id: string;
  eventPassId: string;
  checkInTime: string;
  note?: string;
  eventName: string;
  residentName: string;
  unitNumber: string;
}

// Announcement priority
export type AnnouncementPriority = 'normal' | 'urgent';

// Announcement model
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: string;
}

// Notification types
export type NotificationType = 
  | 'visitor_checkin'
  | 'rent_expiry'
  | 'estate_dues'
  | 'announcement';

// Notification model
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Notification context type
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Navigation param lists
export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string };
};

export type ResidentStackParamList = {
  ResidentTabs: undefined;
  CreateVisitor: undefined;
  CreateEventPass: undefined;
  VisitorDetail: { visitorId: string };
  AnnouncementDetail: { announcementId: string };
};

export type SecurityStackParamList = {
  SecurityTabs: undefined;
  VerifyResult: { visitorId: string };
};
