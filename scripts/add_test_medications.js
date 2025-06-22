// Script to add example medications to the backend via API
// Run with: node scripts/add_test_medications.js

const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';
const MEDICATIONS_URL = `${API_BASE}/medications/`;

const exampleMedications = [
  {
    generic_name: 'Paracetamol',
    brand_name: 'Panadol',
    formulation: 'Tablet',
    strength: '500mg',
    manufacturer: 'GSK',
    supplier_id: 1, // Adjust as needed
    category_id: 1, // Adjust as needed
    unit_of_measure: 'Box',
    reorder_level: 20,
    reorder_quantity: 100,
    storage_conditions: 'Store below 30°C',
    is_controlled_substance: false,
    total_quantity: 500,
    description: 'Pain reliever and fever reducer.'
  },
  {
    generic_name: 'Amoxicillin',
    brand_name: 'Amoxil',
    formulation: 'Capsule',
    strength: '250mg',
    manufacturer: 'Pfizer',
    supplier_id: 1, // Adjust as needed
    category_id: 2, // Adjust as needed
    unit_of_measure: 'Box',
    reorder_level: 10,
    reorder_quantity: 50,
    storage_conditions: 'Store below 25°C',
    is_controlled_substance: false,
    total_quantity: 200,
    description: 'Antibiotic for bacterial infections.'
  },
  {
    generic_name: 'Ibuprofen',
    brand_name: 'Advil',
    formulation: 'Tablet',
    strength: '200mg',
    manufacturer: 'Pfizer',
    supplier_id: 1, // Adjust as needed
    category_id: 1, // Adjust as needed
    unit_of_measure: 'Box',
    reorder_level: 15,
    reorder_quantity: 60,
    storage_conditions: 'Store below 30°C',
    is_controlled_substance: false,
    total_quantity: 300,
    description: 'Nonsteroidal anti-inflammatory drug (NSAID).'
  },
  {
    generic_name: 'Ceftriaxone',
    brand_name: 'Rocephin',
    formulation: 'Injection',
    strength: '1g',
    manufacturer: 'Roche',
    supplier_id: 1, // Adjust as needed
    category_id: 2, // Adjust as needed
    unit_of_measure: 'Vial',
    reorder_level: 5,
    reorder_quantity: 20,
    storage_conditions: 'Refrigerate (2-8°C)',
    is_controlled_substance: false,
    total_quantity: 50,
    description: 'Antibiotic for severe infections.'
  }
];

async function addMedications() {
  for (const med of exampleMedications) {
    try {
      const response = await axios.post(MEDICATIONS_URL, med, {
        headers: { 'Authorization': 'Bearer ' + (process.env.TOKEN || '') }
      });
      console.log('Added:', response.data);
    } catch (err) {
      if (err.response) {
        console.error('Error:', err.response.data);
      } else {
        console.error('Error:', err.message);
      }
    }
  }
}

addMedications();
