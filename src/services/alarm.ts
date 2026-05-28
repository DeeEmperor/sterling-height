import apiClient from './apiClient';

export interface Alarm {
  id: string;
  user_id: string;
  unit_id: string;
  status: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM';
  resident_name?: string;
  resident_phone?: string;
  unit_number?: string;
  created_at: string;
}

export const triggerAlarm = async (): Promise<Alarm> => {
  const response = await apiClient.post('/alarms');
  return response.data.data;
};

export const getActiveAlarms = async (): Promise<Alarm[]> => {
  const response = await apiClient.get('/alarms/active');
  return response.data.data;
};

export const resolveAlarm = async (id: string, status: 'RESOLVED' | 'FALSE_ALARM'): Promise<Alarm> => {
  const response = await apiClient.patch(`/alarms/${id}/resolve`, { status });
  return response.data.data;
};
