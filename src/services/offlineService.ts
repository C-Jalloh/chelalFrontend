import type { Patient } from './patientService';

const DB_NAME = 'ChelalHMS';
const DB_VERSION = 1;
const PATIENTS_STORE_NAME = 'patients';

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PATIENTS_STORE_NAME)) {
        db.createObjectStore(PATIENTS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      db = (event?.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (_event) => {
      reject('Error opening database');
    };
  });
};

export const addPatientOffline = async (patient: Omit<Patient, 'id' | 'status'>): Promise<Patient> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    
    // Generate a temporary ID for offline additions
    const tempId = Date.now() * -1; // Using negative timestamp as a temporary ID
    const patientToAdd: Patient = { ...patient, id: tempId, status: 'pending_add' }; // Explicitly type patientToAdd

    const request = store.add(patientToAdd);

    request.onsuccess = (_event) => {
      // The result of add() is the keyPath value, which is our tempId
      resolve(patientToAdd);
    };

    request.onerror = (_event) => {
      reject('Error adding patient offline');
    };
  });
};

export const getPatientsOffline = async (): Promise<Patient[]> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };

    request.onerror = (_event) => {
      reject('Error getting patients offline');
    };
  });
};

export const updatePatientOffline = async (patient: Patient): Promise<Patient> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    
    // Set status to pending_update if the record is already synced
    const patientToUpdate = { ...patient, status: patient.status === 'synced' ? 'pending_update' : patient.status };

    const request = store.put(patientToUpdate);

    request.onsuccess = () => {
      resolve(patientToUpdate);
    };

    request.onerror = (_event) => {
      reject('Error updating patient offline');
    };
  });
};

export const deletePatientOffline = async (patientId: string | number): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    
    // If the patient was added offline, just delete it. Otherwise, mark as pending_delete.
    const getRequest = store.get(patientId);

    getRequest.onsuccess = (event) => {
      const patient = (event.target as IDBRequest).result as Patient | undefined;
      if (patient && patient.status === 'pending_add') {
        const deleteRequest = store.delete(patientId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = (_event) => reject('Error deleting pending patient offline');
      } else if (patient) {
        const patientToDelete = { ...patient, status: 'pending_delete' };
        const putRequest = store.put(patientToDelete);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = (_event) => reject('Error marking patient for deletion offline');
      } else {
        // Patient not found, assume already deleted or never existed
        resolve();
      }
    };

    getRequest.onerror = (_event) => {
      reject('Error getting patient for offline deletion status check');
    };
  });
};

export const clearPatientsOffline = async (): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (_event) => {
      reject('Error clearing patients offline');
    };
  });
};

export const getPendingPatients = async (): Promise<Patient[]> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const allPatients = (event.target as IDBRequest).result as Patient[];
      const pendingPatients = allPatients.filter(p => p.status !== 'synced');
      resolve(pendingPatients);
    };

    request.onerror = (_event) => {
      reject('Error getting pending patients offline');
    };
  });
};

// Modified syncPatientOffline to accept temporary ID
export const syncPatientOffline = async (tempId: string | number, syncedPatient: Patient): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    
    // Find the patient by its temporary ID
    const getRequest = store.get(tempId);

    getRequest.onsuccess = (event) => {
      const patient = (event.target as IDBRequest).result as Patient | undefined;
      if (patient) {
        // Update the patient with the synced data and status
        // Use the original temporary ID as the key for put()
        const updatedPatient: Patient = { ...patient, ...syncedPatient, id: tempId, status: 'synced' }; 
        const putRequest = store.put(updatedPatient);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = (_event) => reject('Error updating offline patient after sync');
      } else {
        // If patient not found offline (e.g., deleted while offline),
        // or it's a new patient synced from another device (shouldn't happen with this sync flow),
        // we can likely ignore or handle as a conflict.
        console.warn(`Offline patient with temp ID ${tempId} not found during sync.`);
        resolve(); // Resolve as the sync for this item is handled (either deleted or not relevant)
      }
    };

    getRequest.onerror = (_event) => {
      reject('Error getting offline patient for sync update');
    };
  });
};

export const removePatientOffline = async (patientId: string | number): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);
    const request = store.delete(patientId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (_event) => {
      reject('Error removing patient offline');
    };
  });
};

export const syncOnlinePatientsOffline = async (onlinePatients: Patient[]): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PATIENTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE_NAME);

    for (const patient of onlinePatients) {
      // Use put to add or update the patient record
      const patientToPut: Patient = { ...patient, status: 'synced' };
      store.put(patientToPut);
    }

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = (_event) => {
      reject('Error syncing online patients to offline store');
    };
  });
};
