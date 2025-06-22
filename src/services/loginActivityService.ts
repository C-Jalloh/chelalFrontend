import axios from 'axios';

const API_URL = 'http://localhost:8000/api/login-activity/';

export interface LoginActivity {
  id: number;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  status: string;
}

export const fetchLoginActivity = async (token: string): Promise<LoginActivity[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
