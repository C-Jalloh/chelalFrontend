// src/services/encounterService.ts

export interface Encounter {
  id: string | number;
  appointment_id: string | number;
  patient_id: string | number;
  doctor_id: string | number;
  encounter_date: string; // YYYY-MM-DD
  chief_complaint?: string;
  presenting_illness_history?: string;
  physical_examination?: string;
  diagnosis?: string;
  treatment_plan?: string;
  vitals_id?: string | number; // Placeholder for now
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Denormalized fields for display
  patient_name?: string;
  doctor_name?: string;
}

// Assuming we have access to some patient and doctor names for dummy data
// In a real app, these would be fetched or linked more robustly.
let dummyEncounters: Encounter[] = [
  {
    id: 'enc1',
    appointment_id: 'appt1', // Corresponds to an appointment for John Doe with Dr. Alice Wonderland
    patient_id: '1',
    doctor_id: 'doc1',
    encounter_date: '2025-05-28',
    chief_complaint: 'Annual check-up',
    presenting_illness_history: 'Patient feels generally well. No acute issues.',
    physical_examination: 'Within normal limits.',
    diagnosis: 'Routine health maintenance',
    treatment_plan: 'Continue healthy lifestyle. Follow up in 1 year.',
    notes: 'Advised on diet and exercise.',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Alice Wonderland',
    created_at: '2025-05-28T10:30:00Z',
    updated_at: '2025-05-28T10:30:00Z',
  },
  {
    id: 'enc2',
    appointment_id: 'appt3', // Corresponds to an appointment for Fatou Jallow with Dr. Alice Wonderland
    patient_id: '3',
    doctor_id: 'doc1',
    encounter_date: '2025-05-28',
    chief_complaint: 'Vaccination follow-up',
    presenting_illness_history: 'Received vaccination as part of previous visit.',
    physical_examination: 'Injection site looks good, no adverse reactions noted.',
    diagnosis: 'Post-vaccination check',
    treatment_plan: 'No further action needed regarding vaccination.',
    notes: 'Patient tolerated vaccine well.',
    patient_name: 'Fatou Jallow',
    doctor_name: 'Dr. Alice Wonderland',
    created_at: '2025-05-28T11:30:00Z',
    updated_at: '2025-05-28T11:30:00Z',
  },
];

export const fetchEncounters = async (token: string, filters?: { patient_id?: string, appointment_id?: string }): Promise<Encounter[]> => {
  console.log(`Fetching encounters (dummy)... Token: ${token ? 'provided' : 'not provided'}, Filters: ${JSON.stringify(filters)}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...dummyEncounters];
      if (filters?.patient_id) {
        results = results.filter(enc => enc.patient_id === filters.patient_id);
      }
      if (filters?.appointment_id) {
        results = results.filter(enc => enc.appointment_id === filters.appointment_id);
      }
      resolve(results);
    }, 500);
  });
};

export const getEncounterById = async (encounterId: string | number, _token: string): Promise<Encounter | undefined> => {
  console.log(`Fetching encounter by ID ${encounterId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyEncounters.find(enc => enc.id === encounterId));
    }, 300);
  });
};

export const createEncounter = async (encounterData: Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>, _token: string): Promise<Encounter> => {
  console.log('Creating encounter (dummy)...', encounterData);
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, patient_name and doctor_name might be looked up or come from the appointment
      const newEncounter: Encounter = {
        id: `enc${Date.now()}`,
        ...encounterData,
        patient_name: `Patient ${encounterData.patient_id}`,
        doctor_name: `Doctor ${encounterData.doctor_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyEncounters.push(newEncounter);
      resolve(newEncounter);
    }, 500);
  });
};

export const updateEncounter = async (encounterId: string | number, encounterData: Partial<Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>, _token: string): Promise<Encounter | undefined> => {
  console.log(`Updating encounter ${encounterId} (dummy)...`, encounterData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyEncounters.findIndex(enc => enc.id === encounterId);
      if (index !== -1) {
        const updatedEncounter = { ...dummyEncounters[index], ...encounterData, updated_at: new Date().toISOString() };
        dummyEncounters[index] = updatedEncounter;
        resolve(updatedEncounter);
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

export const deleteEncounter = async (encounterId: string | number, _token: string): Promise<void> => {
  console.log(`Deleting encounter ${encounterId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyEncounters = dummyEncounters.filter(enc => enc.id !== encounterId);
      resolve();
    }, 500);
  });
};
