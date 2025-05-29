import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/bills/';

export interface Bill {
  id: string | number;
  patient: string | number;
  total_amount: number;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchBills = async (): Promise<Bill[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const createBill = async (bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, bill, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updateBill = async (bill: Bill): Promise<Bill> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${bill.id}/`, bill, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deleteBill = async (billId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${billId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};
