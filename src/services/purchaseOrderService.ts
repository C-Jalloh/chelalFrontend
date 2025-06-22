import axios from 'axios';
const API_URL = 'http://localhost:8000/api/purchase-orders/';
export const fetchPurchaseOrders = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
export const createPurchaseOrder = async (data: any, token: string) => axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
export const updatePurchaseOrder = async (id: string|number, data: any, token: string) => axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deletePurchaseOrder = async (id: string|number, token: string) => axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
