import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DashboardData,
  DashboardStats,
  PatientCountReport,
  AppointmentsTodayReport,
  AppointmentsByDoctorReport,
  TopMedicationsReport,
  ApiResponse
} from '@/lib/types/dashboard';

// API Base URL - adjust based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error, refetch: () => window.location.reload() };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/dashboard-stats/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
        console.error('Dashboard stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const usePatientCount = () => {
  const [data, setData] = useState<PatientCountReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientCount = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/report/patient_count/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch patient count');
        console.error('Patient count fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientCount();
  }, []);

  return { data, loading, error };
};

export const useAppointmentsToday = () => {
  const [data, setData] = useState<AppointmentsTodayReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentsToday = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/report/appointments_today/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch today\'s appointments');
        console.error('Appointments today fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsToday();
  }, []);

  return { data, loading, error };
};

export const useAppointmentsByDoctor = () => {
  const [data, setData] = useState<AppointmentsByDoctorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentsByDoctor = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/report/appointments_by_doctor/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments by doctor');
        console.error('Appointments by doctor fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsByDoctor();
  }, []);

  return { data, loading, error };
};

export const useTopMedications = () => {
  const [data, setData] = useState<TopMedicationsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopMedications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}/report/top_prescribed_medications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top medications');
        console.error('Top medications fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMedications();
  }, []);

  return { data, loading, error };
};

// Generic API hook for custom endpoints
export const useApiData = <T>(endpoint: string, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('API data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};
