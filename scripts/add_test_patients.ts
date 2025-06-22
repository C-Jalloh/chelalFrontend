// This script will add 5 student (patient) entries for testing pagination in the Patients table.
import { createPatient } from '../src/services/patientService';

async function addTestPatients() {
  const students = [
    {
      unique_id: 'STU1001',
      first_name: 'Alice',
      last_name: 'Johnson',
      date_of_birth: '2002-04-15',
      gender: 'Female',
      contact_info: 'alice.johnson@example.com',
      address: '123 Main St',
      known_allergies: 'None',
    },
    {
      unique_id: 'STU1002',
      first_name: 'Bob',
      last_name: 'Smith',
      date_of_birth: '2001-09-22',
      gender: 'Male',
      contact_info: 'bob.smith@example.com',
      address: '456 Oak Ave',
      known_allergies: 'Peanuts',
    },
    {
      unique_id: 'STU1003',
      first_name: 'Carol',
      last_name: 'Lee',
      date_of_birth: '2003-01-10',
      gender: 'Female',
      contact_info: 'carol.lee@example.com',
      address: '789 Pine Rd',
      known_allergies: 'None',
    },
    {
      unique_id: 'STU1004',
      first_name: 'David',
      last_name: 'Kim',
      date_of_birth: '2000-12-05',
      gender: 'Male',
      contact_info: 'david.kim@example.com',
      address: '321 Maple St',
      known_allergies: 'Latex',
    },
    {
      unique_id: 'STU1005',
      first_name: 'Eva',
      last_name: 'Martins',
      date_of_birth: '2002-07-30',
      gender: 'Female',
      contact_info: 'eva.martins@example.com',
      address: '654 Cedar Blvd',
      known_allergies: 'None',
    },
  ];

  for (const student of students) {
    try {
      const result = await createPatient(student);
      console.log('Added:', result);
    } catch (e) {
      console.error('Failed to add:', student, e);
    }
  }
}

addTestPatients();
