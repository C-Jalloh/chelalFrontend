import axios from 'axios';
const API_URL = 'http://localhost:8000/api/stock-batches/';
export const fetchStockBatches = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
export const createStockBatch = async (data: any, token: string) => axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateStockBatch = async (id: string|number, data: any, token: string) => axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteStockBatch = async (id: string|number, token: string) => axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
