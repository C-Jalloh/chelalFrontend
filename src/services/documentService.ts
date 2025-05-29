import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/documents/';

export interface PatientDocument {
  id: string | number;
  patient: string | number;
  file: string;
  description?: string;
  uploaded_at?: string;
}

export const fetchDocuments = async (): Promise<PatientDocument[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const uploadDocument = async (formData: FormData): Promise<PatientDocument> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deleteDocument = async (documentId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${documentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};
