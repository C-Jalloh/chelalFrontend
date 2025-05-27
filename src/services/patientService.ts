// import axios from 'axios'; // Commented out axios

// const API_URL = 'https://api.example.com/patients'; // Commented out API_URL

export interface Patient {
  id?: string | number; // Allow number for temporary offline IDs
  unique_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_info?: string; // Changed from separate phone and email
  address?: string;
  known_allergies?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'synced' | 'pending_add' | 'pending_update' | 'pending_delete';
}

// Dummy patient data (updated to match backend model)
let dummyPatients: Patient[] = [
  {
    id: '1',
    unique_id: 'A1B2C3D4',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-15',
    gender: 'Male',
    contact_info: '555-1234, john.doe@example.com', // Combined phone and email
    address: '123 Main St',
    known_allergies: 'Penicillin',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-05-26T12:00:00Z',
    status: 'synced',
  },
  {
    id: '2',
    unique_id: 'E5F6G7H8',
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '1985-05-20',
    gender: 'Female',
    contact_info: '555-5678 / jane.smith@example.com', // Combined phone and email
    address: '456 Oak Ave',
    known_allergies: '',
    created_at: '2024-02-10T09:30:00Z',
    updated_at: '2025-05-26T12:00:00Z',
    status: 'synced',
  },
  {
    id: '3',
    unique_id: 'I9J0K1L2',
    first_name: 'Fatou',
    last_name: 'Jallow',
    date_of_birth: '1992-08-12',
    gender: 'Female',
    contact_info: '555-9988 | fatou.jallow@example.com', // Combined phone and email
    address: '789 Palm Rd',
    known_allergies: 'Peanuts, Latex',
    created_at: '2024-03-15T14:20:00Z',
    updated_at: '2025-05-26T12:00:00Z',
    status: 'synced',
  },
  {
    id: '4',
    unique_id: 'M3N4O5P6',
    first_name: 'Ousmane',
    last_name: 'Sarr',
    date_of_birth: '1978-11-03',
    gender: 'Male',
    contact_info: 'ousmane.sarr@example.com (555-3344)', // Combined phone and email
    address: '321 River Ln',
    known_allergies: 'None',
    created_at: '2024-04-22T08:10:00Z',
    updated_at: '2025-05-26T12:00:00Z',
    status: 'synced',
  },
  {
    id: '5',
    unique_id: 'Q7R8S9T0',
    first_name: 'Awa',
    last_name: 'Camara',
    date_of_birth: '2000-12-30',
    gender: 'Female',
    contact_info: '555-7766, awa.camara@example.com', // Combined phone and email
    address: '654 Lake St',
    known_allergies: 'Aspirin',
    created_at: '2024-05-05T11:45:00Z',
    updated_at: '2025-05-26T12:00:00Z',
    status: 'synced',
  },
];

// Dummy fetchPatients function
export const fetchPatients = async (_token: string): Promise<Patient[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyPatients.filter(p => p.status !== 'pending_delete')); // Filter out pending deletes
    }, 500); // Simulate network delay
  });
};

// Dummy createPatient function
export const createPatient = async (patient: Omit<Patient, 'id' | 'status'>, _token: string): Promise<Patient> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPatient: Patient = { ...patient, id: Date.now().toString(), status: 'synced' };
      dummyPatients.push(newPatient);
      resolve(newPatient);
    }, 500); // Simulate network delay
  });
};

// Dummy updatePatient function
export const updatePatient = async (patient: Patient, _token: string): Promise<Patient> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = dummyPatients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        // Ensure status is correctly assigned from the Patient interface literal types
        const updatedPatient: Patient = { ...patient, status: 'synced' };
        dummyPatients[index] = updatedPatient;
        resolve(updatedPatient);
      } else {
        reject(new Error('Dummy patient not found'));
      }
    }, 500); // Simulate network delay
  });
};

// Dummy deletePatient function
export const deletePatient = async (patientId: string | number, _token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = dummyPatients.length;
      dummyPatients = dummyPatients.filter(p => p.id !== patientId);
      if (dummyPatients.length < initialLength) {
        resolve();
      } else {
        reject(new Error('Dummy patient not found'));
      }
    }, 500); // Simulate network delay
  });
};

// Dummy getPatientById function
export const getPatientById = async (patientId: string, _token: string): Promise<Patient> => {
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      const patient = dummyPatients.find(p => p.id === patientId);
      if (patient) {
        resolve(patient);
      } else {
        reject(new Error('Dummy patient not found'));
      }
    }, 500); // Simulate network delay
  });
};

// Commented out handleError function as it's not used with dummy data
// export const handleError = (error: unknown): string => {
//   if (axios.isAxiosError(error)) {
//     return error.response?.data?.message || 'An unexpected error occurred';
//   }
//   return 'An unexpected error occurred';
// };
