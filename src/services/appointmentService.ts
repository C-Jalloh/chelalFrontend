import axios from 'axios';

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

// Dummy doctor data (in a real app, this would come from a userService or similar)
const dummyDoctors = [
  { id: 'doc1', name: 'Dr. Alice Wonderland' },
  { id: 'doc2', name: 'Dr. Bob The Builder' },
  { id: 'doc3', name: 'Dr. Carol Danvers' },
];

// Dummy patient data (simplified, assuming patientService provides full details)
const dummyPatientsForAppointments = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Fatou Jallow' },
];

let dummyAppointments: Appointment[] = [
  {
    id: 'appt1',
    patient_id: '1',
    doctor_id: 'doc1',
    appointment_date: '2025-05-28',
    appointment_time: '10:00:00',
    status: 'Scheduled',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Alice Wonderland',
    notes: 'Routine check-up',
    created_at: '2025-05-20T10:00:00Z',
    updated_at: '2025-05-20T10:00:00Z',
  },
  {
    id: 'appt2',
    patient_id: '2',
    doctor_id: 'doc2',
    appointment_date: '2025-05-29',
    appointment_time: '14:30:00',
    status: 'Scheduled',
    patient_name: 'Jane Smith',
    doctor_name: 'Dr. Bob The Builder',
    notes: 'Follow-up consultation',
    created_at: '2025-05-21T11:00:00Z',
    updated_at: '2025-05-21T11:00:00Z',
  },
  {
    id: 'appt3',
    patient_id: '3',
    doctor_id: 'doc1',
    appointment_date: '2025-05-28',
    appointment_time: '11:00:00',
    status: 'Completed',
    patient_name: 'Fatou Jallow',
    doctor_name: 'Dr. Alice Wonderland',
    notes: 'Vaccination appointment. Completed.',
    created_at: '2025-05-15T14:00:00Z',
    updated_at: '2025-05-28T11:30:00Z',
  },
  {
    id: 'appt4',
    patient_id: '1',
    doctor_id: 'doc3',
    appointment_date: '2025-06-02',
    appointment_time: '09:00:00',
    status: 'Pending',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Carol Danvers',
    notes: 'Awaiting confirmation for specialist visit.',
    created_at: '2025-05-25T16:00:00Z',
    updated_at: '2025-05-25T16:00:00Z',
  },
];

export const fetchAppointments = async (token: string): Promise<Appointment[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAppointmentById = async (appointmentId: string | number, token: string): Promise<Appointment> => {
  const response = await axios.get(`${API_URL}${appointmentId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>, token: string): Promise<Appointment> => {
  const response = await axios.post(API_URL, appointmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAppointment = async (appointmentId: string | number, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>, token: string): Promise<Appointment> => {
  const response = await axios.put(`${API_URL}${appointmentId}/`, appointmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAppointment = async (appointmentId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${appointmentId}/`, {
    headers: { Authorization: `Bearer ${token}` },
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

// Helper to get doctors for forms (in a real app, this would be a separate service)
export const getDoctors = async (): Promise<{ id: string; name: string }[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...dummyDoctors]);
        }, 100);
    });
};
