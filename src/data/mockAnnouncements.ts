/**
 * Mock announcement data for Sterling Height Estate
 * Contains estate announcements with priority levels
 */
import { Announcement } from '../types';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Water Supply Maintenance',
    content: 'There will be a scheduled water supply maintenance on January 10th, 2026 from 8:00 AM to 2:00 PM. Please store sufficient water for use during this period. We apologize for any inconvenience caused.',
    priority: 'urgent',
    createdAt: '2026-01-07T09:00:00Z',
  },
  {
    id: 'ann-002',
    title: 'Estate General Meeting',
    content: 'All residents are invited to attend the quarterly estate general meeting scheduled for January 15th, 2026 at 4:00 PM at the community hall. Agenda includes security updates, maintenance reports, and new estate regulations.',
    priority: 'normal',
    createdAt: '2026-01-06T14:00:00Z',
  },
  {
    id: 'ann-003',
    title: 'New Visitor Policy',
    content: 'Effective immediately, all visitors must present valid government-issued ID at the gate. Visitors without proper identification will be denied entry. This is to enhance security within the estate.',
    priority: 'urgent',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'ann-004',
    title: 'Garden Maintenance Schedule',
    content: 'The estate gardens will be maintained every Tuesday and Friday morning. Residents are kindly requested to keep children and pets away from the garden areas during these times.',
    priority: 'normal',
    createdAt: '2026-01-04T08:00:00Z',
  },
  {
    id: 'ann-005',
    title: 'Power Outage Notice',
    content: 'Due to scheduled maintenance by the power distribution company, there may be power outages on January 12th, 2026. Please make necessary arrangements.',
    priority: 'normal',
    createdAt: '2026-01-03T16:00:00Z',
  },
  {
    id: 'ann-006',
    title: 'Security Alert',
    content: 'There have been reports of suspicious activities in neighboring estates. Residents are advised to be vigilant and report any suspicious persons or activities to the security post immediately.',
    priority: 'urgent',
    createdAt: '2026-01-02T11:00:00Z',
  },
];

/**
 * Get all announcements
 */
export const getAllAnnouncements = (): Announcement[] => {
  return [...mockAnnouncements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get latest announcement
 */
export const getLatestAnnouncement = (): Announcement | undefined => {
  const sorted = getAllAnnouncements();
  return sorted[0];
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = (id: string): Announcement | undefined => {
  return mockAnnouncements.find(ann => ann.id === id);
};

/**
 * Get urgent announcements
 */
export const getUrgentAnnouncements = (): Announcement[] => {
  return mockAnnouncements.filter(ann => ann.priority === 'urgent');
};

export default mockAnnouncements;
