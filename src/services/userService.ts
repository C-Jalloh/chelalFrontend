import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users/';

export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

export const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUserById = async (userId: string | number, token: string): Promise<User> => {
  const response = await axios.get(`${API_URL}${userId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createUser = async (user: Omit<User, 'id'>, token: string): Promise<User> => {
  const response = await axios.post(API_URL, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUser = async (user: User, token: string): Promise<User> => {
  const response = await axios.put(`${API_URL}${user.id}/`, user, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deactivateUser = async (userId: string | number, token: string): Promise<void> => {
  await axios.post(`${API_URL}${userId}/deactivate/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const activateUser = async (userId: string | number, token: string): Promise<void> => {
  await axios.post(`${API_URL}${userId}/activate/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const resetPassword = async (userId: string | number, newPassword: string, token: string): Promise<void> => {
  await axios.post(`${API_URL}${userId}/reset_password/`, { new_password: newPassword }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
