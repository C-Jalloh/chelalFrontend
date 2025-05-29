// src/services/pharmacyService.ts

import axios from 'axios';
import { callApiWithAuthRetry } from './apiClient';
import store from '@/store';

// API endpoints (adjust as needed to match your backend)
const API_BASE = 'http://localhost:8000/api';
const MEDICATIONS_URL = `${API_BASE}/medications/`;
const SUPPLIERS_URL = `${API_BASE}/suppliers/`;
const BATCHES_URL = `${API_BASE}/stock-batches/`;
const PURCHASE_ORDERS_URL = `${API_BASE}/purchase-orders/`;
const GRNS_URL = `${API_BASE}/goods-received-notes/`;
const DISPENSING_LOGS_URL = `${API_BASE}/dispensing-logs/`;
const STOCK_ADJUSTMENTS_URL = `${API_BASE}/stock-adjustments/`;
const CATEGORIES_URL = `${API_BASE}/medication-categories/`;

export interface MedicationCategory {
  id: string | number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string | number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface MedicationItem {
  id: string | number;
  name: string;
  generic_name?: string;
  category_id: string | number;
  supplier_id?: string | number;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Cream' | 'Drops' | 'Other';
  strength?: string;
  unit_of_measure: 'mg' | 'ml' | 'g' | 'IU' | 'mcg' | 'Each';
  reorder_level?: number;
  current_stock_level?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  supplier_name?: string;
}

export interface StockBatch {
  id: string | number;
  medication_item_id: string | number;
  batch_number: string;
  expiry_date: string; 
  quantity_received: number;
  current_quantity: number;
  supplier_id?: string | number;
  received_date: string; 
  cost_price_per_unit?: number;
  notes?: string;
  supplier_name?: string;
}

export interface PurchaseOrderItem {
  id: string | number;
  purchase_order_id: string | number;
  medication_item_id: string | number;
  quantity_ordered: number;
  unit_cost_estimated?: number;
  total_cost_estimated?: number;
  medication_name?: string;
}

export interface PurchaseOrder {
  id: string | number;
  supplier_id: string | number;
  order_date: string; 
  expected_delivery_date?: string;
  status: 'Draft' | 'Ordered' | 'Partially Received' | 'Completed' | 'Cancelled';
  total_estimated_cost?: number;
  notes?: string;
  created_by_user_id?: string | number;
  created_at?: string;
  updated_at?: string;
  supplier_name?: string;
  created_by_user_name?: string;
  items: PurchaseOrderItem[];
}

// New Interfaces for Goods Received Note (GRN)
export interface GRNItem {
  id: string | number;
  grn_id: string | number;
  medication_item_id: string | number;
  purchase_order_item_id?: string | number; // Optional link to PO item
  batch_number: string;
  expiry_date: string; // YYYY-MM-DD
  quantity_received: number;
  unit_cost: number; // Actual cost
  total_cost: number; // quantity_received * unit_cost

  // Denormalized for display
  medication_name?: string;
}

export interface GoodsReceivedNote {
  id: string | number;
  supplier_id: string | number;
  purchase_order_id?: string | number; // Optional
  grn_date: string; // Date goods were received
  received_by_user_id?: string | number;
  invoice_number?: string; // Supplier's invoice number
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Denormalized for display
  supplier_name?: string;
  received_by_user_name?: string;
  items: GRNItem[];
}

// New Interface for DispensingLog
export interface DispensingLog {
  id: string | number;
  prescription_id?: string | number; // Optional, could be direct dispense
  patient_id: string | number; 
  medication_item_id: string | number;
  stock_batch_id: string | number;   
  quantity_dispensed: number;
  dispensed_date: string; // YYYY-MM-DD or full timestamp
  dispensed_by_user_id?: string | number;
  notes?: string;
  created_at?: string;

  // Denormalized for display
  patient_name?: string;
  medication_name?: string;
  batch_number?: string;
  dispensed_by_user_name?: string;
}

// New Interface for StockAdjustment
export type StockAdjustmentType = 
  | 'Damaged' 
  | 'Expired' 
  | 'Physical Count - Increase' 
  | 'Physical Count - Decrease' 
  | 'Returned to Supplier' 
  | 'Internal Transfer' 
  | 'Other';

export interface StockAdjustment {
  id: string | number;
  medication_item_id: string | number;
  stock_batch_id: string | number;  
  adjustment_type: StockAdjustmentType;
  quantity_adjusted: number; // Positive for increase, negative for decrease
  reason?: string;
  adjustment_date: string; // YYYY-MM-DD or full timestamp
  adjusted_by_user_id?: string | number;
  created_at?: string;

  // Denormalized for display
  medication_name?: string;
  batch_number?: string;
  adjusted_by_user_name?: string;
}

// --- Medication Category Functions ---
export const fetchMedicationCategories = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(CATEGORIES_URL, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- Supplier Functions ---
export const fetchSuppliers = async () => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(SUPPLIERS_URL, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- Medication Item CRUD Functions ---
export const fetchMedicationItems = async (filters?: { category_id?: string, name?: string }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(MEDICATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  });
};

export const getMedicationItemById = async (itemId: string | number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${MEDICATIONS_URL}${itemId}/`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const createMedicationItem = async (itemData: Omit<MedicationItem, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'supplier_name' | 'current_stock_level'>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(MEDICATIONS_URL, itemData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const updateMedicationItem = async (itemId: string | number, itemData: Partial<Omit<MedicationItem, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'supplier_name' | 'current_stock_level'>>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${MEDICATIONS_URL}${itemId}/`, itemData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const deleteMedicationItem = async (itemId: string | number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    await axios.delete(`${MEDICATIONS_URL}${itemId}/`, { headers: { Authorization: `Bearer ${token}` } });
  });
};

// --- Purchase Order Functions ---
export const fetchPurchaseOrders = async (filters?: { supplier_id?: string, status?: string, order_date?: string }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(PURCHASE_ORDERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  });
};

export const getPurchaseOrderById = async (poId: string | number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${PURCHASE_ORDERS_URL}${poId}/`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const createPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'created_by_user_name' | 'total_estimated_cost' | 'items'> & { items: Array<Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'medication_name' | 'total_cost_estimated'> & {unit_cost_estimated?: number}> }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(PURCHASE_ORDERS_URL, poData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const updatePurchaseOrder = async (poId: string | number, poData: Partial<Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'created_by_user_name' | 'total_estimated_cost' | 'items'> & { items?: Array<Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'medication_name' | 'total_cost_estimated'> & {medication_item_id: string | number, quantity_ordered: number, unit_cost_estimated?: number}> }>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.put(`${PURCHASE_ORDERS_URL}${poId}/`, poData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- StockBatch Functions ---
export const fetchStockBatchesForItem = async (medicationItemId: string | number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(BATCHES_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: { medication_item_id: medicationItemId },
    });
    return response.data;
  });
};

export const addStockBatch = async (batchData: Omit<StockBatch, 'id' | 'supplier_name'>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(BATCHES_URL, batchData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- GRN Functions ---
export const fetchGRNs = async (filters?: { supplier_id?: string, purchase_order_id?: string }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(GRNS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  });
};

export const getGRNById = async (grnId: string | number) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(`${GRNS_URL}${grnId}/`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

export const createGRN = async (grnData: Omit<GoodsReceivedNote, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'received_by_user_name' | 'items'> & { items: Array<Omit<GRNItem, 'id' | 'grn_id' | 'medication_name' | 'total_cost'> & { unit_cost: number }> }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(GRNS_URL, grnData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- Dispensing Log Functions ---
export const fetchDispensingLogs = async (filters?: { patient_id?: string, medication_item_id?: string }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(DISPENSING_LOGS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  });
};

export const createDispensingLog = async (logData: Omit<DispensingLog, 'id' | 'created_at' | 'patient_name' | 'medication_name' | 'batch_number' | 'dispensed_by_user_name'>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(DISPENSING_LOGS_URL, logData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};

// --- Stock Adjustment Functions ---
export const fetchStockAdjustments = async (filters?: { medication_item_id?: string, stock_batch_id?: string }) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.get(STOCK_ADJUSTMENTS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  });
};

export const createStockAdjustment = async (adjData: Omit<StockAdjustment, 'id' | 'created_at' | 'medication_name' | 'batch_number' | 'adjusted_by_user_name'>) => {
  return callApiWithAuthRetry(async () => {
    const token = store.getters.getToken;
    if (!token) throw new Error('No token available for API call');
    const response = await axios.post(STOCK_ADJUSTMENTS_URL, adjData, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  });
};
