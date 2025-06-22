// Service for fetching alerts
import axios from 'axios';
import store from '@/store';
import { callApiWithAuthRetry } from './apiClient';

export async function fetchAlerts() {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const res = await axios.get('/api/alerts/?unread=true', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.results || [];
  });
}
