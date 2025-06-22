import axios from 'axios';
const API_URL = 'http://localhost:8000/api/service-catalog/';

export const fetchServiceCatalog = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
export const createServiceCatalog = async (data: any, token: string) => axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
export const updateServiceCatalog = async (id: string|number, data: any, token: string) => axios.put(`${API_URL}${id}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteServiceCatalog = async (id: string|number, token: string) => axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
