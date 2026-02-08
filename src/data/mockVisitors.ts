/**
 * Mock visitor data for Sterling Height Estate
 * Contains sample visitor records with various statuses
 */
import { Visitor } from '../types';

// Mutable array to allow adding new visitors
export let mockVisitors: Visitor[] = [
  {
    id: 'visitor-001',
    name: 'Kunle Adesanya',
    residentId: 'user-001',
    residentName: 'Adebayo Johnson',
    unitNumber: 'A-101',
    visitDate: '2026-01-07',
    timeWindowStart: '10:00',
    timeWindowEnd: '14:00',
    carPlateNumber: 'LAG-123-ABC',
    accessCode: '847291',
    status: 'entered',
    checkInTime: '2026-01-07T10:30:00Z',
    createdAt: '2026-01-06T15:00:00Z',
  },
  {
    id: 'visitor-002',
    name: 'Blessing Okafor',
    residentId: 'user-001',
    residentName: 'Adebayo Johnson',
    unitNumber: 'A-101',
    visitDate: '2026-01-08',
    timeWindowStart: '09:00',
    timeWindowEnd: '12:00',
    accessCode: '293847',
    status: 'pending',
    createdAt: '2026-01-07T08:00:00Z',
  },
  {
    id: 'visitor-003',
    name: 'Chukwudi Eze',
    residentId: 'user-002',
    residentName: 'Chioma Okonkwo',
    unitNumber: 'B-205',
    visitDate: '2026-01-06',
    timeWindowStart: '14:00',
    timeWindowEnd: '18:00',
    carPlateNumber: 'ABJ-456-XYZ',
    accessCode: '572039',
    status: 'exited',
    checkInTime: '2026-01-06T14:15:00Z',
    checkOutTime: '2026-01-06T17:45:00Z',
    createdAt: '2026-01-05T20:00:00Z',
  },
  {
    id: 'visitor-004',
    name: 'Unknown Person',
    residentId: 'user-002',
    residentName: 'Chioma Okonkwo',
    unitNumber: 'B-205',
    visitDate: '2026-01-05',
    timeWindowStart: '10:00',
    timeWindowEnd: '11:00',
    accessCode: '999999',
    status: 'denied',
    createdAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'visitor-005',
    name: 'Fatima Abdullahi',
    residentId: 'user-003',
    residentName: 'Emeka Nwosu',
    unitNumber: 'C-310',
    visitDate: '2026-01-07',
    timeWindowStart: '15:00',
    timeWindowEnd: '19:00',
    accessCode: '183746',
    status: 'pending',
    createdAt: '2026-01-07T10:00:00Z',
  },
];

/**
 * Get all visitors
 */
export const getAllVisitors = (): Visitor[] => {
  return [...mockVisitors];
};

/**
 * Get visitors by resident ID
 */
export const getVisitorsByResidentId = (residentId: string): Visitor[] => {
  return mockVisitors.filter(visitor => visitor.residentId === residentId);
};

/**
 * Get visitor by access code
 */
export const getVisitorByAccessCode = (code: string): Visitor | undefined => {
  return mockVisitors.find(visitor => visitor.accessCode === code);
};

/**
 * Get visitor by ID
 */
export const getVisitorById = (id: string): Visitor | undefined => {
  return mockVisitors.find(visitor => visitor.id === id);
};

/**
 * Add a new visitor
 */
export const addVisitor = (visitor: Visitor): void => {
  mockVisitors = [visitor, ...mockVisitors];
};

/**
 * Update visitor status
 */
export const updateVisitorStatus = (
  id: string, 
  status: Visitor['status'],
  checkInTime?: string,
  checkOutTime?: string
): Visitor | undefined => {
  const index = mockVisitors.findIndex(v => v.id === id);
  if (index !== -1) {
    mockVisitors[index] = {
      ...mockVisitors[index],
      status,
      ...(checkInTime && { checkInTime }),
      ...(checkOutTime && { checkOutTime }),
    };
    return mockVisitors[index];
  }
  return undefined;
};

/**
 * Get today's visitor count
 */
export const getTodayVisitorCount = (): number => {
  const today = new Date().toISOString().split('T')[0];
  return mockVisitors.filter(v => v.visitDate === today).length;
};

/**
 * Get today's entered visitor count
 */
export const getTodayEnteredCount = (): number => {
  const today = new Date().toISOString().split('T')[0];
  return mockVisitors.filter(
    v => v.visitDate === today && (v.status === 'entered' || v.status === 'exited')
  ).length;
};

export default mockVisitors;
