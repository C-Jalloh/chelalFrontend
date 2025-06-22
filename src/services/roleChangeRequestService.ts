import axios from 'axios';

const API_URL = 'http://localhost:8000/api/role-change-requests/';

export interface RoleChangeRequest {
  id: number;
  user: any;
  requested_role: any;
  reason: string;
  status: string;
  admin_response: string;
  created_at: string;
  reviewed_at: string | null;
}

export const fetchRoleChangeRequests = async (token: string): Promise<RoleChangeRequest[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createRoleChangeRequest = async (
  requested_role_id: number,
  reason: string,
  token: string
): Promise<RoleChangeRequest> => {
  const response = await axios.post(
    API_URL,
    { requested_role_id, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const approveRoleChangeRequest = async (
  requestId: number,
  admin_response: string,
  token: string
): Promise<void> => {
  await axios.post(
    `${API_URL}${requestId}/approve/`,
    { admin_response },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const rejectRoleChangeRequest = async (
  requestId: number,
  admin_response: string,
  token: string
): Promise<void> => {
  await axios.post(
    `${API_URL}${requestId}/reject/`,
    { admin_response },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
