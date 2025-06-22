import axios from 'axios';
const API_URL = 'http://localhost:8000/api/tasks/';
export const fetchTasks = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
export const createTask = async (data: any, token: string) => axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateTask = async (id: string|number, data: any, token: string) => axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteTask = async (id: string|number, token: string) => axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
