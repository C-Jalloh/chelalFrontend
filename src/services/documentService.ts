import axios from 'axios';

const API_URL = 'http://localhost:8000/api/documents/';

export interface PatientDocument {
  id: string | number;
  patient: string | number;
  file: string;
  description?: string;
  uploaded_at?: string;
}

export const fetchDocuments = async (token: string): Promise<PatientDocument[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadDocument = async (formData: FormData, token: string): Promise<PatientDocument> => {
  const response = await axios.post(API_URL, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteDocument = async (documentId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${documentId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
