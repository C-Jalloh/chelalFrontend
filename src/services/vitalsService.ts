// src/services/vitalsService.ts

export interface Vitals {
  id: string | number;
  encounter_id: string | number; // Link back to the encounter
  temperature_celsius?: number | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  heart_rate_bpm?: number | null;
  respiratory_rate_bpm?: number | null;
  oxygen_saturation_percent?: number | null; // SpO2
  recorded_at: string; // ISO date string, usually when vitals were taken
  // Add other vitals like height, weight, BMI if needed later
}

let dummyVitalsStore: Vitals[] = [
  {
    id: 'vitals1',
    encounter_id: 'enc1', // Linked to John Doe's encounter
    temperature_celsius: 37.0,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    heart_rate_bpm: 70,
    respiratory_rate_bpm: 16,
    oxygen_saturation_percent: 98,
    recorded_at: new Date().toISOString(),
  },
  {
    id: 'vitals2',
    encounter_id: 'enc2', // Linked to Fatou Jallow's encounter
    temperature_celsius: 36.8,
    blood_pressure_systolic: 118,
    blood_pressure_diastolic: 78,
    heart_rate_bpm: 75,
    respiratory_rate_bpm: 18,
    oxygen_saturation_percent: 99,
    recorded_at: new Date().toISOString(),
  },
];

// Fetch vitals for a specific encounter
export const fetchVitalsForEncounter = async (encounterId: string | number, _token: string): Promise<Vitals | undefined> => {
  console.log(`Fetching vitals for encounter ${encounterId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const vitals = dummyVitalsStore.find(v => v.encounter_id === encounterId);
      resolve(vitals);
    }, 300);
  });
};

// Create or update vitals for an encounter (simplified: assumes one set of vitals per encounter for this dummy setup)
export const saveVitalsForEncounter = async (vitalsData: Omit<Vitals, 'id' | 'recorded_at'> & { id?: string | number }, _token: string): Promise<Vitals> => {
  console.log(`Saving vitals for encounter ${vitalsData.encounter_id} (dummy)...`, vitalsData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingIndex = dummyVitalsStore.findIndex(v => v.encounter_id === vitalsData.encounter_id);
      let savedVitals: Vitals;

      if (existingIndex !== -1) {
        // Update existing vitals
        savedVitals = { 
            ...dummyVitalsStore[existingIndex], 
            ...vitalsData, 
            id: dummyVitalsStore[existingIndex].id, // Keep original ID
            recorded_at: new Date().toISOString() 
        };
        dummyVitalsStore[existingIndex] = savedVitals;
      } else {
        // Create new vitals record
        savedVitals = {
          id: `vitals${Date.now()}`,
          ...vitalsData,
          temperature_celsius: vitalsData.temperature_celsius || null,
          blood_pressure_systolic: vitalsData.blood_pressure_systolic || null,
          blood_pressure_diastolic: vitalsData.blood_pressure_diastolic || null,
          heart_rate_bpm: vitalsData.heart_rate_bpm || null,
          respiratory_rate_bpm: vitalsData.respiratory_rate_bpm || null,
          oxygen_saturation_percent: vitalsData.oxygen_saturation_percent || null,
          recorded_at: new Date().toISOString(),
        };
        dummyVitalsStore.push(savedVitals);
      }
      resolve(savedVitals);
    }, 400);
  });
};
