import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

const API_URL = 'http://localhost:8000/api/appointments/';

export interface Appointment {
  id: string | number;
  patient_id: string | number;
  doctor_id: string | number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string;   // HH:MM:SS
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Denormalized fields for easier display - in a real app, these might be populated via joins or separate lookups
  patient_name?: string;
  doctor_name?: string;
}

// New interface for dummy notification info
export interface AppointmentNotificationInfo {
  appointment_id: string | number;
  reminder_sent_at?: string; // ISO date string
  reminder_status?: 'Sent' | 'Failed' | 'Pending' | 'Not Applicable';
  follow_up_sent_at?: string; // ISO date string
  follow_up_status?: 'Sent' | 'Failed' | 'Pending' | 'Not Applicable';
  communication_type?: 'SMS' | 'Email' | 'Both';
}

export const fetchAppointments = async (): Promise<Appointment[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const getAppointmentById = async (appointmentId: string | number): Promise<Appointment> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${API_URL}${appointmentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, appointment, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updateAppointment = async (appointment: Appointment): Promise<Appointment> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${appointment.id}/`, appointment, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deleteAppointment = async (appointmentId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${appointmentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};

// Dummy function to fetch notification info
export const fetchAppointmentNotificationInfo = async (appointmentId: string | number, _token: string): Promise<AppointmentNotificationInfo> => {
  console.log(`Fetching notification info for appointment ${appointmentId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different statuses for different appointments
      const numericId = parseInt(String(appointmentId).replace('appt', ''), 10) % 4;
      let dummyInfo: AppointmentNotificationInfo;
      switch (numericId) {
        case 0:
          dummyInfo = {
            appointment_id: appointmentId,
            reminder_sent_at: '2025-05-27T10:00:00Z',
            reminder_status: 'Sent',
            follow_up_status: 'Pending',
            communication_type: 'SMS',
          };
          break;
        case 1:
          dummyInfo = {
            appointment_id: appointmentId,
            reminder_status: 'Failed',
            follow_up_sent_at: '2025-05-30T14:30:00Z',
            follow_up_status: 'Sent',
            communication_type: 'Email',
          };
          break;
        case 2:
          dummyInfo = {
            appointment_id: appointmentId,
            reminder_sent_at: '2025-05-27T09:00:00Z',
            reminder_status: 'Sent',
            follow_up_sent_at: '2025-05-28T12:30:00Z',
            follow_up_status: 'Sent',
            communication_type: 'Both',
          };
          break;
        default:
          dummyInfo = {
            appointment_id: appointmentId,
            reminder_status: 'Not Applicable',
            follow_up_status: 'Not Applicable',
          };
      }
      resolve(dummyInfo);
    }, 400);
  });
};
