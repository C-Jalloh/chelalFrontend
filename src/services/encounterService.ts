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
    const encounters = response.data;

    // Fetch all appointments, patients, and users for denormalization
    const [appointments, patients, users] = await Promise.all([
      axios.get('http://localhost:8000/api/appointments/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:8000/api/patients/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:8000/api/users/', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const appointmentMap = new Map(appointments.data.map((a: any) => [a.id, a]));
    const patientMap = new Map(patients.data.map((p: any) => [p.id, `${p.first_name} ${p.last_name}`]));
    const doctorMap = new Map(users.data.filter((u: any) => u.role && (u.role.name === 'Doctor' || u.role === 'Doctor')).map((u: any) => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email || u.id]));

    return encounters.map((enc: any) => {
      // Try to get appointment info
      let appt = null;
      if (enc.appointment) appt = appointmentMap.get(enc.appointment);
      else if (enc.appointment_id) appt = appointmentMap.get(enc.appointment_id);
      // Use type guards to check for property existence
      const apptPatient = appt && typeof appt === 'object' && 'patient' in appt ? appt.patient : undefined;
      const apptDoctor = appt && typeof appt === 'object' && 'doctor' in appt ? appt.doctor : undefined;
      const apptDate = appt && typeof appt === 'object' && 'date' in appt ? appt.date : undefined;
      const apptTime = appt && typeof appt === 'object' && 'time' in appt ? appt.time : undefined;
      const patientId = enc.patient || enc.patient_id || apptPatient;
      const doctorId = enc.doctor || enc.doctor_id || apptDoctor;
      const patientName = enc.patient_name || (patientId ? patientMap.get(patientId) : undefined);
      const doctorName = enc.doctor_name || (doctorId ? doctorMap.get(doctorId) : undefined);
      const appointmentDate = enc.appointment_date || apptDate;
      const appointmentTime = enc.appointment_time || apptTime;
      return {
        ...enc,
        patient_name: patientName,
        doctor_name: doctorName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      };
    });
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
