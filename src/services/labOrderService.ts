import axios from 'axios';

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

export const fetchLabOrders = async (token: string): Promise<LabOrder[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createLabOrder = async (labOrder: Omit<LabOrder, 'id' | 'order_date'>, token: string): Promise<LabOrder> => {
  const response = await axios.post(API_URL, labOrder, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateLabOrder = async (labOrder: LabOrder, token: string): Promise<LabOrder> => {
  const response = await axios.put(`${API_URL}${labOrder.id}/`, labOrder, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteLabOrder = async (labOrderId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${labOrderId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
