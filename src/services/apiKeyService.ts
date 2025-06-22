import axios from 'axios';

const API_URL = 'http://localhost:8000/api/api-keys/';

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export const fetchApiKeys = async (token: string): Promise<ApiKey[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createApiKey = async (name: string, token: string): Promise<ApiKey> => {
  const response = await axios.post(API_URL, { name }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const revokeApiKey = async (id: number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
