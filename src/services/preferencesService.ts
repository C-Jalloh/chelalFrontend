import axios from 'axios';

const API_URL = 'http://localhost:8000/api/preferences/';

export interface UserPreferences {
  theme?: 'light' | 'dark';
  // Add more preferences as needed
}

export const getUserPreferences = async (token: string): Promise<UserPreferences> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.preferences || response.data;
};

export const updateUserPreferences = async (prefs: UserPreferences, token: string): Promise<UserPreferences> => {
  const response = await axios.put(API_URL, prefs, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.preferences || response.data;
};
