// src/services/billingService.ts

// Simplified Service Item for dummy data
interface ServiceItem {
  id: string | number;
  name: string;
  price: number;
}

export interface BillItem {
  id: string | number;
  bill_id: string | number;
  service_item_id: string | number;
  service_name: string; // Denormalized
  quantity: number;
  unit_price: number;
  total_price: number; // quantity * unit_price
}

export interface Payment {
  id: string | number;
  bill_id: string | number;
  payment_date: string; // YYYY-MM-DD
  amount_paid: number;
  payment_method: 'Cash' | 'Card' | 'Insurance' | 'Mobile Money' | 'Other';
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

export interface Bill {
  id: string | number;
  patient_id: string | number;
  encounter_id?: string | number;
  bill_date: string; // YYYY-MM-DD
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number; // total_amount - paid_amount
  status: 'Draft' | 'Open' | 'Paid' | 'Partially Paid' | 'Void';
  insurance_id?: string | number;
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Denormalized for display
  patient_name?: string;
  items: BillItem[]; // Bill items associated with this bill
  payments?: Payment[]; // Payments made for this bill
}

// Dummy Service Catalog Items
const dummyServiceItems: ServiceItem[] = [
  { id: 'serv1', name: 'Consultation Fee', price: 500 },
  { id: 'serv2', name: 'Standard Blood Test', price: 1200 },
  { id: 'serv3', name: 'X-Ray (Chest)', price: 2000 },
  { id: 'serv4', name: 'Medication Dispensing Fee', price: 100 },
  { id: 'serv5', name: 'Amoxicillin 250mg Tabs (x20)', price: 350 },
];

// Dummy Payments Data
let dummyPayments: Payment[] = []; // Will be populated when bills are paid

// Dummy Bills Data
let dummyBills: Bill[] = [
  {
    id: 'bill1',
    patient_id: '1', // John Doe
    encounter_id: 'enc1',
    bill_date: '2025-05-28',
    due_date: '2025-06-15',
    total_amount: 1700,
    paid_amount: 0,
    balance_due: 1700,
    status: 'Open',
    patient_name: 'John Doe',
    items: [
      { id: 'bi1', bill_id: 'bill1', service_item_id: 'serv1', service_name: 'Consultation Fee', quantity: 1, unit_price: 500, total_price: 500 },
      { id: 'bi2', bill_id: 'bill1', service_item_id: 'serv2', service_name: 'Standard Blood Test', quantity: 1, unit_price: 1200, total_price: 1200 },
    ],
    payments: [],
    created_at: '2025-05-28T11:00:00Z',
    updated_at: '2025-05-28T11:00:00Z',
  },
  {
    id: 'bill2',
    patient_id: '3', // Fatou Jallow
    encounter_id: 'enc2',
    bill_date: '2025-05-29',
    due_date: '2025-06-20',
    total_amount: 850,
    paid_amount: 850,
    balance_due: 0,
    status: 'Paid',
    patient_name: 'Fatou Jallow',
    items: [
      { id: 'bi3', bill_id: 'bill2', service_item_id: 'serv1', service_name: 'Consultation Fee', quantity: 1, unit_price: 500, total_price: 500 },
      { id: 'bi4', bill_id: 'bill2', service_item_id: 'serv5', service_name: 'Amoxicillin 250mg Tabs (x20)', quantity: 1, unit_price: 350, total_price: 350 },
    ],
    payments: [
        { id: 'pay1', bill_id: 'bill2', payment_date: '2025-05-29', amount_paid: 850, payment_method: 'Cash', created_at: '2025-05-29T14:00:00Z' }
    ],
    created_at: '2025-05-29T13:00:00Z',
    updated_at: '2025-05-29T14:00:00Z',
  },
];

export const fetchBills = async (_token: string, filters?: { patient_id?: string }): Promise<Bill[]> => {
  console.log(`Fetching bills (dummy)... Filters: ${JSON.stringify(filters)}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...dummyBills];
      if (filters?.patient_id) {
        results = results.filter(bill => bill.patient_id === filters.patient_id);
      }
      resolve(results.map(bill => ({ ...bill, balance_due: bill.total_amount - bill.paid_amount })));
    }, 400);
  });
};

export const getBillById = async (billId: string | number, _token: string): Promise<Bill | undefined> => {
  console.log(`Fetching bill by ID ${billId} (dummy)...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const bill = dummyBills.find(b => b.id === billId);
      if (bill) {
        resolve({ ...bill, balance_due: bill.total_amount - bill.paid_amount });
      } else {
        resolve(undefined);
      }
    }, 200);
  });
};

// Simplified createBill - in real app, items would be more complex
export const createBill = async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'balance_due' | 'payments' | 'status'> & { items: Omit<BillItem, 'id' | 'bill_id'>[] }, _token: string): Promise<Bill> => {
  console.log('Creating bill (dummy)...', billData);
  return new Promise((resolve) => {
    setTimeout(() => {
      let totalAmount = 0;
      const billItems: BillItem[] = billData.items.map((item, index) => {
        const service = dummyServiceItems.find(s => s.id === item.service_item_id);
        const unit_price = service?.price || item.unit_price || 0;
        const item_total = item.quantity * unit_price;
        totalAmount += item_total;
        return {
          ...item,
          id: `bi${Date.now()}${index}`,
          bill_id: 'temp-bill-id', // Will be replaced
          service_name: service?.name || 'Unknown Service',
          unit_price: unit_price,
          total_price: item_total,
        };
      });

      const newBill: Bill = {
        id: `bill${Date.now()}`,
        patient_id: billData.patient_id,
        encounter_id: billData.encounter_id,
        bill_date: billData.bill_date || new Date().toISOString().split('T')[0],
        due_date: billData.due_date,
        total_amount: totalAmount,
        paid_amount: 0,
        balance_due: totalAmount,
        status: 'Open',
        patient_name: billData.patient_name || `Patient ${billData.patient_id}`,
        items: [], // Will be updated below
        payments: [],
        notes: billData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      newBill.items = billItems.map(item => ({ ...item, bill_id: newBill.id }));
      dummyBills.push(newBill);
      resolve(newBill);
    }, 500);
  });
};

export const recordPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>, _token: string): Promise<Payment> => {
  console.log('Recording payment (dummy)...', paymentData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const billIndex = dummyBills.findIndex(b => b.id === paymentData.bill_id);
      if (billIndex === -1) {
        reject(new Error('Bill not found'));
        return;
      }

      const bill = dummyBills[billIndex];
      const newPayment: Payment = {
        id: `pay${Date.now()}`,
        ...paymentData,
        created_at: new Date().toISOString(),
      };
      
      dummyPayments.push(newPayment);
      bill.payments = [...(bill.payments || []), newPayment];
      bill.paid_amount += newPayment.amount_paid;
      bill.balance_due = bill.total_amount - bill.paid_amount;

      if (bill.balance_due <= 0) {
        bill.status = 'Paid';
        bill.balance_due = 0; // Ensure balance doesn't go negative
      } else if (bill.paid_amount > 0) {
        bill.status = 'Partially Paid';
      }
      bill.updated_at = new Date().toISOString();
      dummyBills[billIndex] = bill;

      resolve(newPayment);
    }, 400);
  });
};

// Helper to get service items for forms
export const fetchServiceItems = async (_token: string): Promise<ServiceItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...dummyServiceItems]);
        }, 100);
    });
};
