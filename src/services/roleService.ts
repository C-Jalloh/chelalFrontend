import axios from 'axios';

const API_URL = 'http://localhost:8000/api/roles/';

export interface Role {
  id: string | number;
  name: string;
  description?: string;
}

export const fetchRoles = async (token: string): Promise<Role[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
