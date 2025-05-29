import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/patients/';

export interface Patient {
  id?: string | number;
  unique_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_info?: string;
  address?: string;
  known_allergies?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'synced' | 'pending_add' | 'pending_update' | 'pending_delete';
}

export const fetchPatients = async (): Promise<Patient[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'status'>): Promise<Patient> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, patient, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${patient.id}/`, patient, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deletePatient = async (patientId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${patientId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};

export const getPatientById = async (patientId: string): Promise<Patient> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${API_URL}${patientId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};
