/**
 * Visitor Service
 * Handles visitor management operations
 * Structured for easy replacement with real API
 */
import { Visitor, VisitorStatus } from '../types';
import {
  getAllVisitors,
  getVisitorsByResidentId,
  getVisitorByAccessCode,
  getVisitorById,
  addVisitor,
  updateVisitorStatus as updateVisitorStatusData,
  getTodayVisitorCount,
  getTodayEnteredCount,
} from '../data/mockVisitors';
import { getUserById } from '../data/mockUsers';
import { getUnitByResidentId } from '../data/mockUnits';

// Simulated delay for API calls
const API_DELAY = 500;

/**
 * Generate a 6-digit access code
 */
const generateAccessCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate unique visitor ID
 */
const generateVisitorId = (): string => {
  return `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new visitor
 */
export const createVisitor = async (
  residentId: string,
  visitorData: {
    name: string;
    visitDate: string;
    timeWindowStart: string;
    timeWindowEnd: string;
    carPlateNumber?: string;
  }
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const resident = getUserById(residentId);
      const unit = getUnitByResidentId(residentId);

      if (!resident || !unit) {
        resolve({
          success: false,
          message: 'Resident or unit not found',
        });
        return;
      }

      const newVisitor: Visitor = {
        id: generateVisitorId(),
        name: visitorData.name,
        residentId,
        residentName: resident.name,
        unitNumber: unit.unitNumber,
        visitDate: visitorData.visitDate,
        timeWindowStart: visitorData.timeWindowStart,
        timeWindowEnd: visitorData.timeWindowEnd,
        carPlateNumber: visitorData.carPlateNumber,
        accessCode: generateAccessCode(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      addVisitor(newVisitor);

      resolve({
        success: true,
        visitor: newVisitor,
        message: 'Visitor created successfully',
      });
    }, API_DELAY);
  });
};

/**
 * Get visitors for a resident
 */
export const getVisitorsForResident = async (
  residentId: string
): Promise<Visitor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const visitors = getVisitorsByResidentId(residentId);
      // Sort by date, newest first
      visitors.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(visitors);
    }, API_DELAY);
  });
};

/**
 * Verify visitor by access code (for security)
 */
export const verifyVisitorByCode = async (
  code: string
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const visitor = getVisitorByAccessCode(code);

      if (!visitor) {
        resolve({
          success: false,
          message: 'Invalid access code',
        });
        return;
      }

      // Check if visit is for today
      const today = new Date().toISOString().split('T')[0];
      if (visitor.visitDate !== today) {
        resolve({
          success: false,
          visitor,
          message: `Visit scheduled for ${visitor.visitDate}, not today`,
        });
        return;
      }

      // Check if already entered/denied
      if (visitor.status === 'entered' || visitor.status === 'exited') {
        resolve({
          success: true,
          visitor,
          message: 'Visitor has already checked in',
        });
        return;
      }

      if (visitor.status === 'denied') {
        resolve({
          success: false,
          visitor,
          message: 'This visitor was previously denied entry',
        });
        return;
      }

      resolve({
        success: true,
        visitor,
        message: 'Visitor verified successfully',
      });
    }, API_DELAY);
  });
};

/**
 * Update visitor status (mark as entered/denied/exited)
 */
export const updateVisitorStatus = async (
  visitorId: string,
  status: VisitorStatus
): Promise<{ success: boolean; visitor?: Visitor; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      let checkInTime: string | undefined;
      let checkOutTime: string | undefined;

      if (status === 'entered') {
        checkInTime = now;
      } else if (status === 'exited') {
        checkOutTime = now;
      }

      const visitor = updateVisitorStatusData(visitorId, status, checkInTime, checkOutTime);

      if (!visitor) {
        resolve({
          success: false,
          message: 'Visitor not found',
        });
        return;
      }

      resolve({
        success: true,
        visitor,
        message: `Visitor marked as ${status}`,
      });
    }, API_DELAY);
  });
};

/**
 * Get all visitor logs (for security)
 */
export const getVisitorLogs = async (): Promise<Visitor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const visitors = getAllVisitors();
      // Sort by date, newest first
      visitors.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(visitors);
    }, API_DELAY);
  });
};

/**
 * Get today's visitor statistics
 */
export const getTodayStats = async (): Promise<{
  total: number;
  entered: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: getTodayVisitorCount(),
        entered: getTodayEnteredCount(),
      });
    }, API_DELAY / 2);
  });
};

/**
 * Get upcoming visitor for resident (next pending visit)
 */
export const getUpcomingVisitor = async (
  residentId: string
): Promise<Visitor | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const visitors = getVisitorsByResidentId(residentId);
      const today = new Date().toISOString().split('T')[0];
      
      const upcoming = visitors.find(
        v => v.status === 'pending' && v.visitDate >= today
      );
      
      resolve(upcoming || null);
    }, API_DELAY / 2);
  });
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
