import axios from 'axios';

const API_URL = 'http://localhost:8000/api/notifications/';

export interface Notification {
  id: string | number;
  user: string | number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (token: string): Promise<Notification[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const markNotificationRead = async (notificationId: string | number, token: string): Promise<void> => {
  await axios.post(`${API_URL}${notificationId}/mark_read/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
