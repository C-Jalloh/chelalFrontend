// src/services/prescriptionService.ts

export interface Prescription {
  id: string | number;
  encounter_id: string | number;
  patient_id: string | number; // Denormalized from encounter/appointment
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  notes?: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Pending Dispense';
  created_at?: string;
  updated_at?: string;

  // Denormalized for display convenience
  patient_name?: string;
  encounter_date?: string; // From the linked encounter
}

// Dummy Prescriptions Data
let dummyPrescriptions: Prescription[] = [
  {
    id: 'rx1',
    encounter_id: 'enc1', // John Doe's encounter
    patient_id: '1',
    medication_name: 'Amoxicillin 250mg/5ml Suspension',
    dosage: '5ml',
    frequency: 'Three times a day',
    duration: '7 days',
    notes: 'Take with food. Finish entire course.',
    status: 'Active',
    patient_name: 'John Doe',
    encounter_date: '2025-05-28',
    created_at: '2025-05-28T10:35:00Z',
    updated_at: '2025-05-28T10:35:00Z',
  },
  {
    id: 'rx2',
    encounter_id: 'enc1', // John Doe's encounter
    patient_id: '1',
    medication_name: 'Paracetamol 500mg Tablets',
    dosage: '2 tablets',
    frequency: 'As needed for fever (max 4 times a day)',
    duration: '3 days',
    notes: 'Do not exceed 8 tablets in 24 hours.',
    status: 'Pending Dispense',
    patient_name: 'John Doe',
    encounter_date: '2025-05-28',
    created_at: '2025-05-28T10:40:00Z',
    updated_at: '2025-05-28T10:40:00Z',
  },
  {
    id: 'rx3',
    encounter_id: 'enc2', // Fatou Jallow's encounter
    patient_id: '3',
    medication_name: 'Ibuprofen 200mg Tablets',
    dosage: '1 tablet',
    frequency: 'Every 6 hours as needed for pain',
    notes: 'May cause stomach upset.',
    status: 'Completed',
    patient_name: 'Fatou Jallow',
    encounter_date: '2025-05-28',
    created_at: '2025-05-28T11:35:00Z',
    updated_at: '2025-05-29T11:35:00Z',
  },
  // Additional prescriptions for John Doe (patient_id: '1', encounter_id: 'enc1')
  {
    id: 'rx4',
    encounter_id: 'enc1',
    patient_id: '1',
    medication_name: 'Salbutamol Inhaler 100mcg',
    dosage: '2 puffs',
    frequency: 'As needed for wheezing',
    duration: 'Ongoing',
    notes: 'Use spacer device if possible.',
    status: 'Active',
    patient_name: 'John Doe',
    encounter_date: '2025-05-28',
    created_at: '2025-05-28T10:45:00Z',
    updated_at: '2025-05-28T10:45:00Z',
  },
  // Additional prescription for Fatou Jallow (patient_id: '3', encounter_id: 'enc2')
  {
    id: 'rx5',
    encounter_id: 'enc2',
    patient_id: '3',
    medication_name: 'Cetirizine 10mg Tablets',
    dosage: '1 tablet',
    frequency: 'Once daily in the evening',
    duration: '14 days',
    notes: 'For seasonal allergies.',
    status: 'Active',
    patient_name: 'Fatou Jallow',
    encounter_date: '2025-05-28',
    created_at: '2025-05-28T11:40:00Z',
    updated_at: '2025-05-28T11:40:00Z',
  },
  // Prescription for a different patient/encounter if available, or new dummy encounter
  // For now, focusing on multiple for existing patients.
];

export const fetchPrescriptions = async (_token: string, filters?: { patient_id?: string, encounter_id?: string }): Promise<Prescription[]> => {
  console.log(`Fetching prescriptions (dummy)... Filters: ${JSON.stringify(filters)}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...dummyPrescriptions];
      if (filters?.patient_id) {
        results = results.filter(rx => rx.patient_id === filters.patient_id);
      }
      if (filters?.encounter_id) {
        results = results.filter(rx => rx.encounter_id === filters.encounter_id);
      }
      resolve(results);
    }, 400);
  });
};

export const getPrescriptionById = async (prescriptionId: string | number, _token: string): Promise<Prescription | undefined> => {
  console.log(`Fetching prescription by ID ${prescriptionId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyPrescriptions.find(rx => rx.id === prescriptionId));
    }, 200);
  });
};

export const createPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'encounter_date'>, _token: string): Promise<Prescription> => {
  console.log('Creating prescription (dummy)...', prescriptionData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPrescription: Prescription = {
        id: `rx${Date.now()}`,
        ...prescriptionData,
        patient_name: `Patient ${prescriptionData.patient_id}`, // Simplified for dummy data
        encounter_date: new Date().toISOString().split('T')[0], // Placeholder, ideally from linked encounter
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyPrescriptions.push(newPrescription);
      resolve(newPrescription);
    }, 400);
  });
};

export const updatePrescription = async (prescriptionId: string | number, prescriptionData: Partial<Omit<Prescription, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'encounter_date'>>, _token: string): Promise<Prescription | undefined> => {
  console.log(`Updating prescription ${prescriptionId} (dummy)...`, prescriptionData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyPrescriptions.findIndex(rx => rx.id === prescriptionId);
      if (index !== -1) {
        const updatedPrescription = { 
            ...dummyPrescriptions[index], 
            ...prescriptionData, 
            updated_at: new Date().toISOString() 
        };
        // Update denormalized fields if core linking fields change (e.g. patient_id)
        if (prescriptionData.patient_id && prescriptionData.patient_id !== dummyPrescriptions[index].patient_id) {
            updatedPrescription.patient_name = `Patient ${prescriptionData.patient_id}`;
        }
        // Similar logic if encounter_id changes for encounter_date
        dummyPrescriptions[index] = updatedPrescription;
        resolve(updatedPrescription);
      } else {
        resolve(undefined);
      }
    }, 400);
  });
};

export const deletePrescription = async (prescriptionId: string | number, _token: string): Promise<void> => {
  console.log(`Deleting prescription ${prescriptionId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyPrescriptions = dummyPrescriptions.filter(rx => rx.id !== prescriptionId);
      resolve();
    }, 400);
  });
};
