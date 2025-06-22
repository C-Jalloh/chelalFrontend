import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';
const API_URL = 'http://localhost:8000/api/beds/';

export const fetchBeds = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const assignPatientToBed = async (bedId: string|number, patientId: string|number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.post(`${API_URL}${bedId}/assign_patient/`, { patient_id: patientId }, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const dischargePatientFromBed = async (bedId: string|number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.post(`${API_URL}${bedId}/discharge_patient/`, {}, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const createBed = async (bed: any) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.post(API_URL, bed, { headers: { Authorization: `Bearer ${token}` } });
  });
};

export const updateBed = async (bedId: string|number, bed: any) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    return axios.put(`${API_URL}${bedId}/`, bed, { headers: { Authorization: `Bearer ${token}` } });
  });
};
