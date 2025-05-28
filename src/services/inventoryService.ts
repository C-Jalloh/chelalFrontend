import axios from 'axios';

const API_URL = 'http://localhost:8000/api/inventory/';

export interface InventoryItem {
  id: string | number;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  updated_at?: string;
}

export const fetchInventory = async (token: string): Promise<InventoryItem[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'updated_at'>, token: string): Promise<InventoryItem> => {
  const response = await axios.post(API_URL, item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateInventoryItem = async (item: InventoryItem, token: string): Promise<InventoryItem> => {
  const response = await axios.put(`${API_URL}${item.id}/`, item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteInventoryItem = async (itemId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${itemId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
