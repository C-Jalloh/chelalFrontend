// Script to add 10 doctors and create an appointment for every patient in the system
const axios = require('axios');

const API_URL_USERS = 'http://localhost:8000/api/users/';
const API_URL_PATIENTS = 'http://localhost:8000/api/patients/';
const API_URL_APPOINTMENTS = 'http://localhost:8000/api/appointments/';
const DOCTOR_ROLE_ID = 2; // Doctor role id from backend
const TOKEN = process.env.API_TOKEN || '';
if (!TOKEN) throw new Error('No token available for API call. Set API_TOKEN env variable.');

const headers = { Authorization: `Bearer ${TOKEN}` };

async function createDoctor(doctor) {
  // Add doctor as a user with role Doctor
  const response = await axios.post(API_URL_USERS, doctor, { headers });
  return response.data;
}

async function fetchDoctors() {
  // Fetch all users with role=2 (Doctor)
  const response = await axios.get(`${API_URL_USERS}?role=${DOCTOR_ROLE_ID}`, { headers });
  return response.data;
}

async function fetchPatients() {
  const response = await axios.get(API_URL_PATIENTS, { headers });
  return response.data;
}

async function createAppointment(appointment) {
  const response = await axios.post(API_URL_APPOINTMENTS, appointment, { headers });
  return response.data;
}

async function main() {
  // 1. Add 10 doctors
  for (let i = 1; i <= 10; i++) {
    const doctor = {
      username: `doctor${i}`,
      email: `doctor${i}@example.com`,
      first_name: `Doctor${i}`,
      last_name: `Test${i}`,
      password: 'changeme123',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      role: DOCTOR_ROLE_ID
    };
    try {
      const created = await createDoctor(doctor);
      console.log('Added doctor:', created);
    } catch (e) {
      console.error('Failed to add doctor:', doctor, e.response ? e.response.data : e);
    }
  }

  // 2. Fetch all doctors (users with Doctor role)
  let doctors = [];
  try {
    doctors = await fetchDoctors();
    // Filter out only those with a valid numeric id and active status
    doctors = doctors.filter(doc => typeof doc.id === 'number' && doc.id > 0 && doc.is_active);
    if (doctors.length === 0) {
      console.error('No valid active doctor IDs found in backend. Aborting appointment creation.');
      return;
    }
    console.log('Valid active doctor IDs:', doctors.map(doc => doc.id));
  } catch (e) {
    console.error('Failed to fetch doctors:', e.response ? e.response.data : e);
    return;
  }

  // 3. Fetch all patients
  let patients = [];
  try {
    patients = await fetchPatients();
  } catch (e) {
    console.error('Failed to fetch patients:', e.response ? e.response.data : e);
    return;
  }

  // 4. Create an appointment for every patient, assign a random doctor
  for (const patient of patients) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const time = '10:00:00';
    const appointment = {
      patient: patient.id, // Use 'patient' not 'patient_id'
      doctor: doctor.id,   // Use 'doctor' not 'doctor_id'
      date,
      time,
      status: 'scheduled', // Use valid status value
      notes: 'Auto-generated appointment.'
    };
    try {
      const created = await createAppointment(appointment);
      console.log('Added appointment:', created);
    } catch (e) {
      console.error('Failed to add appointment for patient:', patient, e.response ? e.response.data : e);
    }
  }
}

main();
