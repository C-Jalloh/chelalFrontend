// src/services/appointmentService.ts

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

export const fetchAppointments = async (_token: string): Promise<Appointment[]> => {
  console.log('Fetching appointments (dummy)...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...dummyAppointments]);
    }, 500);
  });
};

export const getAppointmentById = async (appointmentId: string | number, _token: string): Promise<Appointment | undefined> => {
  console.log(`Fetching appointment by ID ${appointmentId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyAppointments.find(appt => appt.id === appointmentId));
    }, 300);
  });
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>, _token: string): Promise<Appointment> => {
  console.log('Creating appointment (dummy)...', appointmentData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const patient = dummyPatientsForAppointments.find(p => p.id === appointmentData.patient_id);
      const doctor = dummyDoctors.find(d => d.id === appointmentData.doctor_id);

      const newAppointment: Appointment = {
        id: `appt${Date.now()}`,
        ...appointmentData,
        patient_name: patient?.name || 'Unknown Patient',
        doctor_name: doctor?.name || 'Unknown Doctor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyAppointments.push(newAppointment);
      resolve(newAppointment);
    }, 500);
  });
};

export const updateAppointment = async (appointmentId: string | number, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>, _token: string): Promise<Appointment | undefined> => {
  console.log(`Updating appointment ${appointmentId} (dummy)...`, appointmentData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyAppointments.findIndex(appt => appt.id === appointmentId);
      if (index !== -1) {
        const patient = appointmentData.patient_id ? dummyPatientsForAppointments.find(p => p.id === appointmentData.patient_id) : undefined;
        const doctor = appointmentData.doctor_id ? dummyDoctors.find(d => d.id === appointmentData.doctor_id) : undefined;

        const updatedAppointment = { ...dummyAppointments[index], ...appointmentData };
        
        if (patient) updatedAppointment.patient_name = patient.name;
        if (doctor) updatedAppointment.doctor_name = doctor.name;
        updatedAppointment.updated_at = new Date().toISOString();
        
        dummyAppointments[index] = updatedAppointment;
        resolve(updatedAppointment);
      } else {
        resolve(undefined); // Or reject with an error
      }
    }, 500);
  });
};

export const deleteAppointment = async (appointmentId: string | number, _token: string): Promise<void> => {
  console.log(`Deleting appointment ${appointmentId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyAppointments = dummyAppointments.filter(appt => appt.id !== appointmentId);
      resolve();
    }, 500);
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
