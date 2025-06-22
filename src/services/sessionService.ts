import axios from 'axios';
const API_URL = 'http://localhost:8000/api/sessions/';
export const fetchSessions = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
