import axios from 'axios';
const API_URL = 'http://localhost:8000/api/resource-bookings/';
export const fetchResourceBookings = async (token: string) => axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
