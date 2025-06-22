import axios from 'axios';

const API_URL = 'http://localhost:8000/api/register/';

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: number; // Role ID (optional)
}

export const registerUser = async (data: RegistrationData): Promise<any> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};
