import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';
const API_URL = 'http://localhost:8000/api/audit_logs/';

export const fetchAuditLogs = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export async function fetchRecentAuditLogs() {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const res = await axios.get('/api/audit-logs/?limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.results || [];
  });
}
