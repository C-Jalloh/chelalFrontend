import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/lab_orders/';

export interface LabOrder {
  id: string | number;
  encounter: string | number;
  test_name: string;
  specimen_type?: string;
  order_date?: string;
  status?: string;
  result_details?: string;
  result_file?: string;
}

export const fetchLabOrders = async (): Promise<LabOrder[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const createLabOrder = async (labOrder: Omit<LabOrder, 'id' | 'order_date'>): Promise<LabOrder> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, labOrder, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updateLabOrder = async (labOrder: LabOrder): Promise<LabOrder> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${labOrder.id}/`, labOrder, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deleteLabOrder = async (labOrderId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${labOrderId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};
