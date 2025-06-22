import axios from 'axios';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/delegateaccess/';

export interface DelegateAccess {
  id: number;
  user: number;
  user_username: string;
  delegate: number;
  delegate_username: string;
  can_manage_schedule: boolean;
  can_view_data: boolean;
  can_act_as_user: boolean;
  created_at: string;
  revoked: boolean;
  revoked_at: string | null;
}

export const fetchDelegates = async (): Promise<DelegateAccess[]> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addDelegate = async (delegateId: number, permissions: Partial<Omit<DelegateAccess, 'id' | 'user' | 'user_username' | 'delegate_username' | 'created_at' | 'revoked' | 'revoked_at'>>): Promise<DelegateAccess> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.post(API_URL, { delegate: delegateId, ...permissions }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const revokeDelegate = async (delegateAccessId: number): Promise<DelegateAccess> => {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const response = await axios.patch(`${API_URL}${delegateAccessId}/`, { revoked: true }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
