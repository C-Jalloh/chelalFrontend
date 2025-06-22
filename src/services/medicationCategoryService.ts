import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';
const API_URL = 'http://localhost:8000/api/medication-categories/';

export const fetchMedicationCategories = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const createMedicationCategory = async (data: any) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const updateMedicationCategory = async (id: string|number, data: any) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const deleteMedicationCategory = async (id: string|number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
  });
};
