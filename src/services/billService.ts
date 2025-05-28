import axios from 'axios';

const API_URL = 'http://localhost:8000/api/bills/';

export interface Bill {
  id: string | number;
  patient: string | number;
  total_amount: number;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchBills = async (token: string): Promise<Bill[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createBill = async (bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>, token: string): Promise<Bill> => {
  const response = await axios.post(API_URL, bill, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateBill = async (bill: Bill, token: string): Promise<Bill> => {
  const response = await axios.put(`${API_URL}${bill.id}/`, bill, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteBill = async (billId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${billId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
