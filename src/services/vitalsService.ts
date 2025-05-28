// src/services/vitalsService.ts
import axios from 'axios';

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

const API_URL = 'http://localhost:8000/api/vitals/';

// Fetch vitals for a specific encounter
export const fetchVitalsForEncounter = async (encounterId: string | number, token: string): Promise<Vitals | undefined> => {
  const response = await axios.get(`${API_URL}?encounter=${encounterId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Assuming the backend returns a list, get the first vitals record for the encounter
  return response.data.length > 0 ? response.data[0] : undefined;
};

// Create or update vitals for an encounter (simplified: assumes one set of vitals per encounter for this dummy setup)
export const saveVitalsForEncounter = async (vitalsData: Omit<Vitals, 'id' | 'recorded_at'> & { id?: string | number }, token: string): Promise<Vitals> => {
  if (vitalsData.id) {
    // Update existing
    const response = await axios.put(`${API_URL}${vitalsData.id}/`, vitalsData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } else {
    // Create new
    const response = await axios.post(API_URL, vitalsData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};
