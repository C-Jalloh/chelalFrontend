import axios from 'axios';
const API_URL = 'http://localhost:8000/api/purchase-order-items/';

export const fetchPurchaseOrderItems = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
export const createPurchaseOrderItem = async (data: any, token: string) => axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
export const updatePurchaseOrderItem = async (id: string|number, data: any, token: string) => axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deletePurchaseOrderItem = async (id: string|number, token: string) => axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
