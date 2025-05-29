import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/notifications/';

export interface Notification {
  id: string | number;
  user: string | number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const markNotificationRead = async (notificationId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.post(`${API_URL}${notificationId}/mark_read/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};
