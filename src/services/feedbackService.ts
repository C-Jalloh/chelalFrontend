import axios from 'axios';

const API_URL = 'http://localhost:8000/api/feedback/';

export interface Feedback {
  id: number;
  message: string;
  contact_email: string;
  created_at: string;
  resolved: boolean;
}

export const submitFeedback = async (message: string, contact_email: string, token: string): Promise<Feedback> => {
  const response = await axios.post(API_URL, { message, contact_email }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchFeedback = async (token: string): Promise<Feedback[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
