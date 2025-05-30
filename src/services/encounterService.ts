// src/services/encounterService.ts

import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

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
  appointment_date?: string;
  appointment_time?: string;
}

const API_URL = 'http://localhost:8000/api/encounters/';

export const fetchEncounters = async (filters?: { patient_id?: string, appointment_id?: string }): Promise<Encounter[]> => {
  return callApiWithAuthRetry(async () => {
    let url = API_URL;
    if (filters?.patient_id) url += `?patient_id=${filters.patient_id}`;
    if (filters?.appointment_id) url += `${filters.patient_id ? '&' : '?'}appointment_id=${filters.appointment_id}`;
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Map backend fields to frontend fields for denormalized info
    return response.data.map((enc: any) => ({
      ...enc,
      patient_name: enc.patient_name,
      doctor_name: enc.doctor_name,
      appointment_date: enc.appointment_date,
      appointment_time: enc.appointment_time,
    }));
  });
};

export const getEncounterById = async (encounterId: string | number): Promise<Encounter> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${API_URL}${encounterId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const enc = response.data;
    return {
      ...enc,
      patient_name: enc.patient_name,
      doctor_name: enc.doctor_name,
      appointment_date: enc.appointment_date,
      appointment_time: enc.appointment_time,
    };
  });
};

export const createEncounter = async (encounterData: Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>): Promise<Encounter> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(API_URL, encounterData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const updateEncounter = async (encounterId: string | number, encounterData: Partial<Omit<Encounter, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'doctor_name'>>): Promise<Encounter> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${API_URL}${encounterId}/`, encounterData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  });
};

export const deleteEncounter = async (encounterId: string | number): Promise<void> => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${API_URL}${encounterId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
};
