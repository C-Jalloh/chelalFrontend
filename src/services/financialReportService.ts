import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';
const API_URL = 'http://localhost:8000/api/financial-reports/';

export const fetchFinancialReports = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  });
};
