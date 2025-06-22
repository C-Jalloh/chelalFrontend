import axios from 'axios';

export interface DashboardStats {
  total_patients: number;
  active_users: number;
  revenue_today: number;
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  const response = await axios.get('/api/dashboard-stats/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
