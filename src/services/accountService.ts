import axios from 'axios';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/account/';

export const downloadUserData = async (): Promise<Blob> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.get(`${API_URL}download-data/`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  return response.data;
};

export const deleteAccount = async (): Promise<void> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  await axios.delete(`${API_URL}delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
