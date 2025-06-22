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
    // Fetch appointments
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appointments = response.data.map((appt: any) => ({
      ...appt,
      appointment_date: appt.date,
      appointment_time: appt.time,
      patient_id: appt.patient, // Ensure patient_id is always present
      doctor_id: appt.doctor,   // Ensure doctor_id is always present
    }));
    // Fetch patients and users for denormalization
    const [patients, users] = await Promise.all([
      axios.get('http://localhost:8000/api/patients/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:8000/api/users/', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const patientMap = new Map(patients.data.map((p: any) => [p.id, `${p.first_name} ${p.last_name}`]));
    const doctorMap = new Map(users.data.filter((u: any) => u.role && (u.role.name === 'Doctor' || u.role === 'Doctor')).map((u: any) => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email || u.id]));
    // Attach names to each appointment
    return appointments.map((appt: any) => ({
      ...appt,
      patient_name: patientMap.get(appt.patient) || appt.patient,
      doctor_name: doctorMap.get(appt.doctor) || appt.doctor
    }));
  });
};

export const getAppointmentById = async (appointmentId: string | number): Promise<Appointment> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${API_URL}${appointmentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appt = response.data;
    return {
      ...appt,
      appointment_date: appt.date,
      appointment_time: appt.time,
    };
  });
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    // Map frontend fields to backend fields
    const backendPayload = {
      patient: appointment.patient_id,
      doctor: appointment.doctor_id,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      status: appointment.status ? appointment.status.toLowerCase() : 'scheduled',
      notes: appointment.notes,
    };
    const response = await axios.post(API_URL, backendPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updateAppointment = async (appointment: Appointment): Promise<Appointment> => {
  if (!appointment.id) {
    throw new Error('Cannot update appointment: appointment ID is undefined');
  }
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
  if (!appointmentId) {
    throw new Error('Cannot delete appointment: appointment ID is undefined');
  }
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

export const getDoctors = async (): Promise<any[]> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    // Fetch all users, then filter for doctors (assuming backend provides role info)
    const response = await axios.get('http://localhost:8000/api/users/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Filter users with role 'Doctor'
    return response.data.filter((user: any) => user.role && user.role.name === 'Doctor');
  });
};

export interface AppointmentBackend {
  id?: string | number;
  patient: string | number;
  doctor: string | number;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export const updateAppointmentBackend = async (appointment: AppointmentBackend): Promise<any> => {
  if (!appointment.id) {
    throw new Error('Cannot update appointment: appointment ID is undefined');
  }
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${appointment.id}/`, appointment, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

// New function to fetch upcoming appointments
export async function fetchUpcomingAppointments() {
  const token = store.getters.getToken;
  if (!token) throw new Error('No token available for API call');
  const res = await axios.get('/api/appointments/?upcoming=true&limit=5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.results || [];
}
