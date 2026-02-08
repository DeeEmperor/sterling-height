/**
 * Mock user data for Sterling Height Estate
 * Contains sample residents and security personnel
 */
import { User } from '../types';

export const mockUsers: User[] = [
  // Residents
  {
    id: 'user-001',
    name: 'Adebayo Johnson',
    phone: '+2348012345678',
    role: 'resident',
    unitId: 'unit-001',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-002',
    name: 'Chioma Okonkwo',
    phone: '+2348023456789',
    role: 'resident',
    unitId: 'unit-002',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'user-003',
    name: 'Emeka Nwosu',
    phone: '+2348034567890',
    role: 'resident',
    unitId: 'unit-003',
    createdAt: '2024-03-10T09:15:00Z',
  },
  // Security personnel
  {
    id: 'user-004',
    name: 'Ibrahim Musa',
    phone: '+2348045678901',
    role: 'security',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'user-005',
    name: 'Tunde Bakare',
    phone: '+2348056789012',
    role: 'security',
    createdAt: '2024-01-05T08:00:00Z',
  },
];

/**
 * Find user by phone number (used during login)
 */
export const findUserByPhone = (phone: string): User | undefined => {
  // Normalize phone number for comparison
  const normalizedPhone = phone.replace(/\s/g, '');
  return mockUsers.find(user => 
    user.phone.replace(/\s/g, '') === normalizedPhone ||
    user.phone.endsWith(normalizedPhone.slice(-10))
  );
};

/**
 * Get user by ID
 */
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export default mockUsers;
