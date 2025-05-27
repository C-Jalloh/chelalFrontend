// src/services/pharmacyService.ts

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

// --- Dummy Data ---
const dummyCategories: MedicationCategory[] = [
  { id: 'cat1', name: 'Antibiotics', description: 'Medications to treat bacterial infections.' },
  { id: 'cat2', name: 'Analgesics', description: 'Pain relievers.' },
  { id: 'cat3', name: 'Antihistamines', description: 'For allergic reactions.' },
  { id: 'cat4', name: 'Vitamins & Supplements', description: 'Nutritional supplements.' },
];

const dummySuppliers: Supplier[] = [
  { id: 'sup1', name: 'PharmaPlus Inc.', contact_person: 'Ali Baba', phone: '555-0101', email: 'sales@pharmaplus.com' },
  { id: 'sup2', name: 'MediSupply Co.', contact_person: 'Fatima Zahra', phone: '555-0202', email: 'orders@medisupply.co' },
];

let dummyMedicationItems: MedicationItem[] = [
  {
    id: 'med1',
    name: 'Amoxicillin 250mg Capsules',
    generic_name: 'Amoxicillin Trihydrate',
    category_id: 'cat1',
    supplier_id: 'sup1',
    form: 'Capsule',
    strength: '250mg',
    unit_of_measure: 'Each',
    reorder_level: 50,
    current_stock_level: 120,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-05-01T10:00:00Z',
  },
  {
    id: 'med2',
    name: 'Paracetamol 500mg Tablets',
    generic_name: 'Acetaminophen',
    category_id: 'cat2',
    supplier_id: 'sup2',
    form: 'Tablet',
    strength: '500mg',
    unit_of_measure: 'Each',
    reorder_level: 100,
    current_stock_level: 350,
    created_at: '2025-01-15T11:00:00Z',
    updated_at: '2025-05-10T11:00:00Z',
  },
  {
    id: 'med3',
    name: 'Cetirizine 10mg Syrup',
    generic_name: 'Cetirizine Dihydrochloride',
    category_id: 'cat3',
    supplier_id: 'sup1',
    form: 'Syrup',
    strength: '10mg/5ml',
    unit_of_measure: 'ml',
    reorder_level: 30,
    current_stock_level: 75,
    created_at: '2025-02-01T09:00:00Z',
    updated_at: '2025-04-20T09:00:00Z',
  },
];

let dummyStockBatches: StockBatch[] = [
  {
    id: 'batch1',
    medication_item_id: 'med1',
    batch_number: 'AMX250-001',
    expiry_date: '2026-12-31',
    quantity_received: 100,
    current_quantity: 80,
    supplier_id: 'sup1',
    received_date: '2025-01-05',
    cost_price_per_unit: 15,
  },
  {
    id: 'batch2',
    medication_item_id: 'med1',
    batch_number: 'AMX250-002',
    expiry_date: '2027-06-30',
    quantity_received: 50,
    current_quantity: 40,
    supplier_id: 'sup1',
    received_date: '2025-04-10',
    cost_price_per_unit: 16,
  },
  {
    id: 'batch3',
    medication_item_id: 'med2',
    batch_number: 'PARA500-001',
    expiry_date: '2026-08-31',
    quantity_received: 500,
    current_quantity: 350,
    supplier_id: 'sup2',
    received_date: '2025-01-12',
    cost_price_per_unit: 2,
  },
  {
    id: 'batch4',
    medication_item_id: 'med3',
    batch_number: 'CETSYR-001',
    expiry_date: '2025-11-30',
    quantity_received: 100,
    current_quantity: 75,
    supplier_id: 'sup1',
    received_date: '2025-01-20',
    cost_price_per_unit: 45,
  },
];

let dummyPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1',
    supplier_id: 'sup1',
    order_date: '2025-05-20',
    expected_delivery_date: '2025-06-05',
    status: 'Ordered',
    items: [
      {
        id: 'poi1-1',
        purchase_order_id: 'po1',
        medication_item_id: 'med1',
        quantity_ordered: 200,
        unit_cost_estimated: 14,
      },
      {
        id: 'poi1-2',
        purchase_order_id: 'po1',
        medication_item_id: 'med3',
        quantity_ordered: 50,
        unit_cost_estimated: 42,
      },
    ],
    created_at: '2025-05-20T09:00:00Z',
    updated_at: '2025-05-20T09:00:00Z',
  },
  {
    id: 'po2',
    supplier_id: 'sup2',
    order_date: '2025-05-22',
    expected_delivery_date: '2025-06-10',
    status: 'Draft',
    items: [
      {
        id: 'poi2-1',
        purchase_order_id: 'po2',
        medication_item_id: 'med2',
        quantity_ordered: 1000,
        unit_cost_estimated: 1.8,
      },
    ],
    created_at: '2025-05-22T14:00:00Z',
    updated_at: '2025-05-22T14:00:00Z',
  },
];

dummyPurchaseOrders.forEach(po => {
  po.total_estimated_cost = po.items.reduce((sum, item) => sum + (item.quantity_ordered * (item.unit_cost_estimated || 0)), 0);
  po.items.forEach(item => item.total_cost_estimated = item.quantity_ordered * (item.unit_cost_estimated || 0) );
});

let dummyGRNs: GoodsReceivedNote[] = [
  {
    id: 'grn1',
    supplier_id: 'sup1',
    purchase_order_id: 'po1',
    grn_date: '2025-06-03',
    received_by_user_name: 'Admin User',
    invoice_number: 'INV-SUP1-001',
    supplier_name: 'PharmaPlus Inc.',
    items: [
      {
        id: 'grni1-1',
        grn_id: 'grn1',
        medication_item_id: 'med1', // Amoxicillin
        purchase_order_item_id: 'poi1-1',
        batch_number: 'AMX250-GRN001',
        expiry_date: '2027-12-31',
        quantity_received: 200,
        unit_cost: 14.5,
        total_cost: 2900,
        medication_name: 'Amoxicillin 250mg Capsules',
      },
      {
        id: 'grni1-2',
        grn_id: 'grn1',
        medication_item_id: 'med3', // Cetirizine Syrup
        purchase_order_item_id: 'poi1-2',
        batch_number: 'CETSYR-GRN001',
        expiry_date: '2026-10-31',
        quantity_received: 50,
        unit_cost: 43,
        total_cost: 2150,
        medication_name: 'Cetirizine 10mg Syrup',
      },
    ],
    created_at: '2025-06-03T10:00:00Z',
    updated_at: '2025-06-03T10:00:00Z',
  }
];

let dummyDispensingLogs: DispensingLog[] = [
  {
    id: 'disp1',
    prescription_id: 'rx1', // Amoxicillin for John Doe
    patient_id: '1',
    medication_item_id: 'med1',
    stock_batch_id: 'batch1', // AMX250-001
    quantity_dispensed: 20, // Assuming a course requires 20 units (e.g., capsules)
    dispensed_date: '2025-05-28T14:00:00Z',
    dispensed_by_user_name: 'Pharmacist User',
    patient_name: 'John Doe',
    medication_name: 'Amoxicillin 250mg Capsules',
    batch_number: 'AMX250-001',
    created_at: '2025-05-28T14:00:00Z',
  },
  {
    id: 'disp2',
    patient_id: '3', // Fatou Jallow, direct dispense or from a different prescription not listed
    medication_item_id: 'med2', // Paracetamol
    stock_batch_id: 'batch3', // PARA500-001
    quantity_dispensed: 10, // 10 tablets
    dispensed_date: '2025-05-29T10:15:00Z',
    dispensed_by_user_name: 'Pharmacist User',
    notes: 'OTC for headache',
    patient_name: 'Fatou Jallow',
    medication_name: 'Paracetamol 500mg Tablets',
    batch_number: 'PARA500-001',
    created_at: '2025-05-29T10:15:00Z',
  },
];

let dummyStockAdjustments: StockAdjustment[] = [
  {
    id: 'adj1',
    medication_item_id: 'med1', // Amoxicillin
    stock_batch_id: 'batch1',   // AMX250-001
    adjustment_type: 'Damaged',
    quantity_adjusted: -5, // 5 units damaged
    reason: 'Water damage to packaging',
    adjustment_date: '2025-06-01T10:00:00Z',
    adjusted_by_user_name: 'Pharmacist User',
    medication_name: 'Amoxicillin 250mg Capsules',
    batch_number: 'AMX250-001',
    created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'adj2',
    medication_item_id: 'med2', // Paracetamol
    stock_batch_id: 'batch3',   // PARA500-001
    adjustment_type: 'Physical Count - Decrease',
    quantity_adjusted: -10, // 10 units missing from count
    reason: 'Discrepancy during weekly stock count',
    adjustment_date: '2025-06-02T15:00:00Z',
    adjusted_by_user_name: 'Pharmacist User',
    medication_name: 'Paracetamol 500mg Tablets',
    batch_number: 'PARA500-001',
    created_at: '2025-06-02T15:00:00Z',
  },
];

// --- Medication Category Functions ---
export const fetchMedicationCategories = async (_token?: string): Promise<MedicationCategory[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...dummyCategories]), 100));
};

// --- Supplier Functions ---
export const fetchSuppliers = async (_token?: string): Promise<Supplier[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...dummySuppliers]), 100));
};

// --- Medication Item CRUD Functions ---
export const fetchMedicationItems = async (_token: string, filters?: { category_id?: string, name?: string }): Promise<MedicationItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = dummyMedicationItems.map(item => ({
        ...item,
        category_name: dummyCategories.find(c => c.id === item.category_id)?.name || 'Unknown Category',
        supplier_name: dummySuppliers.find(s => s.id === item.supplier_id)?.name || 'N/A',
      }));
      if (filters?.category_id) {
        results = results.filter(item => item.category_id === filters.category_id);
      }
      if (filters?.name) {
        results = results.filter(item => 
          item.name.toLowerCase().includes(filters.name!.toLowerCase()) || 
          item.generic_name?.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      resolve(results);
    }, 300);
  });
};

export const getMedicationItemById = async (itemId: string | number, _token: string): Promise<MedicationItem | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = dummyMedicationItems.find(i => i.id === itemId);
      if (item) {
        resolve({
          ...item,
          category_name: dummyCategories.find(c => c.id === item.category_id)?.name,
          supplier_name: dummySuppliers.find(s => s.id === item.supplier_id)?.name,
        });
      } else {
        resolve(undefined);
      }
    }, 200);
  });
};

export const createMedicationItem = async (itemData: Omit<MedicationItem, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'supplier_name' | 'current_stock_level'>, _token: string): Promise<MedicationItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newItem: MedicationItem = {
        id: `med${Date.now()}`,
        ...itemData,
        current_stock_level: 0, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyMedicationItems.push(newItem);
      resolve(newItem);
    }, 400);
  });
};

export const updateMedicationItem = async (itemId: string | number, itemData: Partial<Omit<MedicationItem, 'id' | 'created_at' | 'updated_at' | 'category_name' | 'supplier_name' | 'current_stock_level'>>, _token: string): Promise<MedicationItem | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyMedicationItems.findIndex(i => i.id === itemId);
      if (index !== -1) {
        const updatedItemData = { ...dummyMedicationItems[index], ...itemData };
        dummyMedicationItems[index] = {
            ...updatedItemData,
            updated_at: new Date().toISOString(),
        };
        resolve(dummyMedicationItems[index]);
      } else {
        resolve(undefined);
      }
    }, 400);
  });
};

export const deleteMedicationItem = async (itemId: string | number, _token: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyMedicationItems = dummyMedicationItems.filter(i => i.id !== itemId);
      resolve();
    }, 300);
  });
};

// --- Purchase Order Functions ---
export const createPurchaseOrder = async (
  poData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'created_by_user_name' | 'total_estimated_cost' | 'items'> 
          & { items: Array<Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'medication_name' | 'total_cost_estimated'> & {unit_cost_estimated?: number}> }, 
  _token?: string
): Promise<PurchaseOrder> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let totalEstimatedCost = 0;
      const newPOId = `po${Date.now()}`;
      const poItems: PurchaseOrderItem[] = poData.items.map((item, index) => {
        const medItem = dummyMedicationItems.find(m => m.id === item.medication_item_id);
        const itemTotal = (item.quantity_ordered || 0) * (item.unit_cost_estimated || 0);
        totalEstimatedCost += itemTotal;
        return {
          ...item,
          id: `poi-${newPOId}-${index}`,
          purchase_order_id: newPOId,
          medication_name: medItem?.name || 'Unknown Medication',
          total_cost_estimated: itemTotal,
        };
      });

      const newPurchaseOrder: PurchaseOrder = {
        id: newPOId,
        supplier_id: poData.supplier_id,
        order_date: poData.order_date,
        expected_delivery_date: poData.expected_delivery_date,
        status: poData.status, 
        notes: poData.notes,
        created_by_user_id: poData.created_by_user_id, 
        items: poItems,
        total_estimated_cost: totalEstimatedCost,
        supplier_name: dummySuppliers.find(s => s.id === poData.supplier_id)?.name || 'Unknown Supplier',
        created_by_user_name: 'Current User (Dummy)', 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyPurchaseOrders.push(newPurchaseOrder);
      resolve(newPurchaseOrder);
    }, 400);
  });
};

export const updatePurchaseOrder = async (
  poId: string | number,
  poData: Partial<Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'created_by_user_name' | 'total_estimated_cost' | 'items'> & { items?: Array<Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'medication_name' | 'total_cost_estimated'> & {medication_item_id: string | number, quantity_ordered: number, unit_cost_estimated?: number}> }>, 
  _token?: string
): Promise<PurchaseOrder | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const poIndex = dummyPurchaseOrders.findIndex(p => p.id === poId);
      if (poIndex === -1) {
        return reject(new Error('Purchase Order not found'));
      }

      const existingPO = dummyPurchaseOrders[poIndex];
      let totalEstimatedCost = 0;
      let updatedItems: PurchaseOrderItem[] = existingPO.items; // Default to existing items

      // If items are provided in poData, replace/update them
      if (poData.items) {
        updatedItems = poData.items.map((item, index) => {
          const medItem = dummyMedicationItems.find(m => m.id === item.medication_item_id);
          const itemTotal = (item.quantity_ordered || 0) * (item.unit_cost_estimated || 0);
          totalEstimatedCost += itemTotal;
          return {
            ...item,
            id: `poi-${poId}-${index}`, // Regenerate item IDs based on PO ID and index
            purchase_order_id: poId,
            medication_name: medItem?.name || 'Unknown Medication',
            total_cost_estimated: itemTotal,
          };
        });
      } else {
        // If no items in poData, recalculate cost from existing items
        totalEstimatedCost = existingPO.items.reduce((sum, item) => sum + (item.total_cost_estimated || 0), 0);
      }

      const updatedPurchaseOrder: PurchaseOrder = {
        ...existingPO,
        ...poData, // Apply other PO field updates
        items: updatedItems,
        total_estimated_cost: totalEstimatedCost,
        supplier_name: poData.supplier_id ? (dummySuppliers.find(s => s.id === poData.supplier_id)?.name || 'Unknown Supplier') : existingPO.supplier_name,
        // created_by_user_name could be updated if created_by_user_id changes, but that's less common for an update
        updated_at: new Date().toISOString(),
      };

      dummyPurchaseOrders[poIndex] = updatedPurchaseOrder;
      resolve(updatedPurchaseOrder);
    }, 400);
  });
};

export const getPurchaseOrderById = async (poId: string | number, _token?: string): Promise<PurchaseOrder | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const po = dummyPurchaseOrders.find(p => p.id === poId);
      if (po) {
        resolve({
          ...po,
          supplier_name: dummySuppliers.find(s => s.id === po.supplier_id)?.name || 'Unknown Supplier',
          created_by_user_name: 'Current User (Dummy)', // Placeholder
          items: po.items.map(item => ({
            ...item,
            medication_name: dummyMedicationItems.find(m => m.id === item.medication_item_id)?.name || 'Unknown Medication'
          }))
        });
      } else {
        resolve(undefined);
      }
    }, 200);
  });
};

// --- StockBatch Functions ---
export const fetchStockBatchesForItem = async (medicationItemId: string | number, _token?: string): Promise<StockBatch[]> => {
  console.log(`Fetching stock batches for item ${medicationItemId} (dummy)...`);
  return new Promise(resolve => {
    setTimeout(() => {
      const batches = dummyStockBatches
        .filter(batch => batch.medication_item_id === medicationItemId)
        .map(batch => ({
          ...batch,
          supplier_name: dummySuppliers.find(s => s.id === batch.supplier_id)?.name || 'N/A',
        }));
      resolve(batches);
    }, 250);
  });
};

export const addStockBatch = async (batchData: Omit<StockBatch, 'id' | 'supplier_name'>, _token?: string): Promise<StockBatch> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newBatch: StockBatch = {
        id: `batch${Date.now()}`,
        ...batchData,
        supplier_name: dummySuppliers.find(s => s.id === batchData.supplier_id)?.name || 'N/A',
      };
      dummyStockBatches.push(newBatch);
      resolve(newBatch);
    }, 300);
  });
};

// --- Goods Received Note (GRN) Functions ---
export const fetchGRNs = async (_token?: string, filters?: { supplier_id?: string, purchase_order_id?: string }): Promise<GoodsReceivedNote[]> => {
  console.log(`Fetching GRNs (dummy)... Filters: ${JSON.stringify(filters)}`);
  return new Promise(resolve => {
    setTimeout(() => {
      let results = dummyGRNs.map(grn => ({
        ...grn,
        supplier_name: dummySuppliers.find(s => s.id === grn.supplier_id)?.name || 'Unknown Supplier',
        // received_by_user_name: fetch user name if needed
      }));
      if (filters?.supplier_id) {
        results = results.filter(grn => grn.supplier_id === filters.supplier_id);
      }
      if (filters?.purchase_order_id) {
        results = results.filter(grn => grn.purchase_order_id === filters.purchase_order_id);
      }
      resolve(results);
    }, 300);
  });
};

export const getGRNById = async (grnId: string | number, _token?: string): Promise<GoodsReceivedNote | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const grn = dummyGRNs.find(g => g.id === grnId);
      if (grn) {
        resolve({
          ...grn,
          supplier_name: dummySuppliers.find(s => s.id === grn.supplier_id)?.name || 'Unknown Supplier',
          items: grn.items.map(item => ({
            ...item,
            medication_name: dummyMedicationItems.find(m => m.id === item.medication_item_id)?.name || 'Unknown Medication'
          }))
        });
      } else {
        resolve(undefined);
      }
    }, 200);
  });
};

export const createGRN = async (
  grnData: Omit<GoodsReceivedNote, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'received_by_user_name' | 'items'> 
           & { items: Array<Omit<GRNItem, 'id' | 'grn_id' | 'medication_name' | 'total_cost'> & { unit_cost: number }> }, 
  _token?: string
): Promise<GoodsReceivedNote> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const newGRNId = `grn${Date.now()}`;
      const grnItems: GRNItem[] = grnData.items.map((item, index) => {
        const medItem = dummyMedicationItems.find(m => m.id === item.medication_item_id);
        const itemTotalCost = (item.quantity_received || 0) * (item.unit_cost || 0);
        return {
          ...item,
          id: `grni-${newGRNId}-${index}`,
          grn_id: newGRNId,
          medication_name: medItem?.name || 'Unknown Medication',
          total_cost: itemTotalCost,
        };
      });

      const newGRN: GoodsReceivedNote = {
        id: newGRNId,
        ...grnData,
        items: grnItems,
        supplier_name: dummySuppliers.find(s => s.id === grnData.supplier_id)?.name || 'Unknown Supplier',
        received_by_user_name: 'Current User (Dummy)', // Placeholder
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dummyGRNs.push(newGRN);

      // --- IMPORTANT: Update Stock Batches and Medication Item Stock Levels ---
      newGRN.items.forEach(grnItem => {
        const newBatch: StockBatch = {
          id: `batch-${newGRNId}-${grnItem.medication_item_id}-${grnItem.batch_number}`,
          medication_item_id: grnItem.medication_item_id,
          batch_number: grnItem.batch_number,
          expiry_date: grnItem.expiry_date,
          quantity_received: grnItem.quantity_received,
          current_quantity: grnItem.quantity_received, 
          supplier_id: newGRN.supplier_id,
          supplier_name: newGRN.supplier_name,
          received_date: newGRN.grn_date,
          cost_price_per_unit: grnItem.unit_cost,
        };
        dummyStockBatches.push(newBatch);

        const medItemIndex = dummyMedicationItems.findIndex(m => m.id === grnItem.medication_item_id);
        if (medItemIndex !== -1) {
          dummyMedicationItems[medItemIndex].current_stock_level = 
            (dummyMedicationItems[medItemIndex].current_stock_level || 0) + grnItem.quantity_received;
        }
      });
      // --- End Stock Update Logic ---

      resolve(newGRN);
    }, 500);
  });
};

// --- Dispensing Log Functions ---
export const fetchDispensingLogs = async (_token?: string, filters?: { patient_id?: string, medication_item_id?: string }): Promise<DispensingLog[]> => {
  console.log(`Fetching dispensing logs (dummy)... Filters: ${JSON.stringify(filters)}`);
  return new Promise(resolve => {
    setTimeout(() => {
      let results = dummyDispensingLogs.map(log => ({
        ...log,
        // patient_name: Look up from a patient service if not already denormalized
        // medication_name: Look up from medicationItems if not already denormalized
        // batch_number: Look up from stockBatches if not already denormalized
      }));
      if (filters?.patient_id) {
        results = results.filter(log => log.patient_id === filters.patient_id);
      }
      if (filters?.medication_item_id) {
        results = results.filter(log => log.medication_item_id === filters.medication_item_id);
      }
      resolve(results);
    }, 300);
  });
};

export const createDispensingLog = async (
  logData: Omit<DispensingLog, 'id' | 'created_at' | 'patient_name' | 'medication_name' | 'batch_number' | 'dispensed_by_user_name'>,
  _token?: string
): Promise<DispensingLog> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Validate stock availability from the chosen batch
      const batchIndex = dummyStockBatches.findIndex(b => b.id === logData.stock_batch_id);
      if (batchIndex === -1) {
        return reject(new Error('Stock batch not found.'));
      }
      const stockBatch = dummyStockBatches[batchIndex];
      if (stockBatch.current_quantity < logData.quantity_dispensed) {
        return reject(new Error(`Insufficient stock in batch ${stockBatch.batch_number}. Available: ${stockBatch.current_quantity}`));
      }

      // 2. Validate medication item exists
      const medItemIndex = dummyMedicationItems.findIndex(m => m.id === logData.medication_item_id);
      if (medItemIndex === -1) {
        return reject(new Error('Medication item not found.'));
      }

      // 3. Create the dispensing log entry
      const newLog: DispensingLog = {
        id: `disp${Date.now()}`,
        ...logData,
        // Denormalized fields should be populated based on IDs
        patient_name: `Patient ${logData.patient_id}`, // Placeholder
        medication_name: dummyMedicationItems[medItemIndex].name,
        batch_number: stockBatch.batch_number,
        dispensed_by_user_name: 'Current User (Dummy)', // Placeholder
        created_at: new Date().toISOString(),
      };
      dummyDispensingLogs.push(newLog);

      // 4. Update stock batch quantity
      dummyStockBatches[batchIndex].current_quantity -= logData.quantity_dispensed;

      // 5. Update medication item total stock level
      dummyMedicationItems[medItemIndex].current_stock_level = 
        (dummyMedicationItems[medItemIndex].current_stock_level || 0) - logData.quantity_dispensed;

      // TODO: Optionally update prescription status if prescription_id is provided

      resolve(newLog);
    }, 500);
  });
};

// --- Stock Adjustment Functions ---
export const fetchStockAdjustments = async (_token?: string, filters?: { medication_item_id?: string, stock_batch_id?: string }): Promise<StockAdjustment[]> => {
  console.log(`Fetching stock adjustments (dummy)... Filters: ${JSON.stringify(filters)}`);
  return new Promise(resolve => {
    setTimeout(() => {
      let results = dummyStockAdjustments.map(adj => ({
        ...adj,
        // Populate denormalized fields if not already present
        medication_name: adj.medication_name || dummyMedicationItems.find(m => m.id === adj.medication_item_id)?.name || 'Unknown Medication',
        batch_number: adj.batch_number || dummyStockBatches.find(b => b.id === adj.stock_batch_id)?.batch_number || 'Unknown Batch',
      }));
      if (filters?.medication_item_id) {
        results = results.filter(adj => adj.medication_item_id === filters.medication_item_id);
      }
      if (filters?.stock_batch_id) {
        results = results.filter(adj => adj.stock_batch_id === filters.stock_batch_id);
      }
      resolve(results);
    }, 300);
  });
};

export const createStockAdjustment = async (
  adjData: Omit<StockAdjustment, 'id' | 'created_at' | 'medication_name' | 'batch_number' | 'adjusted_by_user_name'>,
  _token?: string
): Promise<StockAdjustment> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Validate batch and medication item
      const batchIndex = dummyStockBatches.findIndex(b => b.id === adjData.stock_batch_id);
      if (batchIndex === -1) {
        return reject(new Error('Stock batch not found.'));
      }
      const stockBatch = dummyStockBatches[batchIndex];
      if (stockBatch.medication_item_id !== adjData.medication_item_id) {
        return reject(new Error('Batch does not belong to the specified medication item.'));
      }

      const medItemIndex = dummyMedicationItems.findIndex(m => m.id === adjData.medication_item_id);
      if (medItemIndex === -1) {
        return reject(new Error('Medication item not found.'));
      }

      // 2. Check if adjustment makes batch quantity negative (unless it's an increase)
      if (adjData.quantity_adjusted < 0 && (stockBatch.current_quantity + adjData.quantity_adjusted < 0)) {
        // Allow going negative if it's a decrease from a physical count, but generally this might be an issue.
        // For simplicity, we'll allow it for now but a real system might have stricter rules.
        console.warn(`Warning: Stock adjustment for batch ${stockBatch.batch_number} results in negative quantity.`);
      }

      // 3. Create the stock adjustment entry
      const newAdjustment: StockAdjustment = {
        id: `adj${Date.now()}`,
        ...adjData,
        medication_name: dummyMedicationItems[medItemIndex].name,
        batch_number: stockBatch.batch_number,
        adjusted_by_user_name: 'Current User (Dummy)', // Placeholder
        created_at: new Date().toISOString(),
      };
      dummyStockAdjustments.push(newAdjustment);

      // 4. Update stock batch quantity
      dummyStockBatches[batchIndex].current_quantity += adjData.quantity_adjusted;

      // 5. Update medication item total stock level
      dummyMedicationItems[medItemIndex].current_stock_level = 
        (dummyMedicationItems[medItemIndex].current_stock_level || 0) + adjData.quantity_adjusted;

      resolve(newAdjustment);
    }, 500);
  });
};

// --- New Purchase Order Fetch Function ---
export const fetchPurchaseOrders = async (_token?: string, filters?: { supplier_id?: string, status?: string, order_date?: string }): Promise<PurchaseOrder[]> => {
  // Simulate async fetch and filtering
  return new Promise(resolve => {
    setTimeout(() => {
      let results = dummyPurchaseOrders.map(po => ({
        ...po,
        supplier_name: dummySuppliers.find(s => s.id === po.supplier_id)?.name || 'Unknown Supplier',
        created_by_user_name: 'Current User (Dummy)', // Placeholder
      }));
      if (filters?.supplier_id) {
        results = results.filter(po => po.supplier_id === filters.supplier_id);
      }
      if (filters?.status) {
        results = results.filter(po => po.status === filters.status);
      }
      if (filters?.order_date) {
        results = results.filter(po => po.order_date === filters.order_date);
      }
      resolve(results);
    }, 300);
  });
};
