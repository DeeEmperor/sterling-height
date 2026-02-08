/**
 * Mock unit data for Sterling Height Estate
 * Contains property/unit information with rent and dues data
 */
import { Unit, EstateDue } from '../types';

export const mockUnits: Unit[] = [
  {
    id: 'unit-001',
    unitNumber: 'A-101',
    residentId: 'user-001',
    residentName: 'Adebayo Johnson',
    ownershipType: 'owner',
  },
  {
    id: 'unit-002',
    unitNumber: 'B-205',
    residentId: 'user-002',
    residentName: 'Chioma Okonkwo',
    ownershipType: 'tenant',
    rentStartDate: '2025-06-01',
    rentExpiryDate: '2026-02-28', // About 2 months away
  },
  {
    id: 'unit-003',
    unitNumber: 'C-310',
    residentId: 'user-003',
    residentName: 'Emeka Nwosu',
    ownershipType: 'tenant',
    rentStartDate: '2025-01-01',
    rentExpiryDate: '2026-01-15', // Very soon
  },
];

export const mockEstateDues: EstateDue[] = [
  // Dues for unit A-101
  {
    id: 'due-001',
    type: 'Security Levy',
    amount: 50000,
    dueDate: '2026-01-31',
    status: 'due',
    unitId: 'unit-001',
  },
  {
    id: 'due-002',
    type: 'Waste Management',
    amount: 15000,
    dueDate: '2025-12-15',
    status: 'overdue',
    unitId: 'unit-001',
  },
  {
    id: 'due-003',
    type: 'Street Lighting',
    amount: 10000,
    dueDate: '2025-11-30',
    status: 'paid',
    unitId: 'unit-001',
  },
  // Dues for unit B-205
  {
    id: 'due-004',
    type: 'Security Levy',
    amount: 50000,
    dueDate: '2026-01-31',
    status: 'paid',
    unitId: 'unit-002',
  },
  {
    id: 'due-005',
    type: 'Waste Management',
    amount: 15000,
    dueDate: '2026-01-15',
    status: 'due',
    unitId: 'unit-002',
  },
  // Dues for unit C-310
  {
    id: 'due-006',
    type: 'Security Levy',
    amount: 50000,
    dueDate: '2025-12-31',
    status: 'overdue',
    unitId: 'unit-003',
  },
  {
    id: 'due-007',
    type: 'Waste Management',
    amount: 15000,
    dueDate: '2026-02-15',
    status: 'due',
    unitId: 'unit-003',
  },
];

/**
 * Get unit by ID
 */
export const getUnitById = (id: string): Unit | undefined => {
  return mockUnits.find(unit => unit.id === id);
};

/**
 * Get unit by resident ID
 */
export const getUnitByResidentId = (residentId: string): Unit | undefined => {
  return mockUnits.find(unit => unit.residentId === residentId);
};

/**
 * Get dues for a unit
 */
export const getDuesByUnitId = (unitId: string): EstateDue[] => {
  return mockEstateDues.filter(due => due.unitId === unitId);
};

export default mockUnits;
