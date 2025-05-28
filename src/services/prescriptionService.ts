import axios from 'axios';

const API_URL = 'http://localhost:8000/api/prescriptions/';

export interface Prescription {
  id: string | number;
  encounter: string | number;
  medication_name: string;
  dosage: string;
  frequency: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchPrescriptions = async (token: string): Promise<Prescription[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPrescription = async (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>, token: string): Promise<Prescription> => {
  const response = await axios.post(API_URL, prescription, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updatePrescription = async (prescription: Prescription, token: string): Promise<Prescription> => {
  const response = await axios.put(`${API_URL}${prescription.id}/`, prescription, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deletePrescription = async (prescriptionId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${prescriptionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
