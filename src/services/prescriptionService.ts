import axios from 'axios';
import { fetchEncounters, type Encounter } from './encounterService';
import { fetchPatients, type Patient } from './patientService';

const API_URL = 'http://localhost:8000/api/prescriptions/';

export interface Prescription {
  id: string | number;
  encounter: string | number;
  medication_name: string;
  dosage: string;
  frequency: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchPrescriptions = async (token: string): Promise<any[]> => {
  // Fetch prescriptions from backend
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const prescriptions = response.data;

  // Fetch all encounters and patients for denormalization
  const [encounters, patients] = await Promise.all([
    fetchEncounters(),
    fetchPatients()
  ]);
  const encounterMap = new Map(encounters.map((e: Encounter) => [e.id, e]));
  const patientMap = new Map(patients.map((p: Patient) => [p.id, `${p.first_name} ${p.last_name}`]));

  // Attach denormalized fields
  return prescriptions.map((rx: any) => {
    const encounter = encounterMap.get(rx.encounter || rx.encounter_id);
    const patientName = encounter ? patientMap.get(encounter.patient_id) : undefined;
    return {
      ...rx,
      encounter_id: rx.encounter || rx.encounter_id,
      patient_name: patientName || 'N/A',
      status: rx.status || 'Active',
      encounter_date: encounter?.encounter_date || '',
    };
  });
};

export const createPrescription = async (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>, token: string): Promise<Prescription> => {
  const response = await axios.post(API_URL, prescription, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updatePrescription = async (prescription: Prescription, token: string): Promise<Prescription> => {
  const response = await axios.put(`${API_URL}${prescription.id}/`, prescription, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deletePrescription = async (prescriptionId: string | number, token: string): Promise<void> => {
  await axios.delete(`${API_URL}${prescriptionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
