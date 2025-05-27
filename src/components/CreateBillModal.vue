<template>
  <div class="create-bill-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit" class="bill-form">
        <div class="form-scrollable-content">
          <div class="form-grid top-grid">
            <div class="form-group">
              <label for="patient">Patient *</label>
              <select id="patient" v-model="bill.patient_id" @change="handlePatientSelection" required>
                <option disabled value="">Select Patient</option>
                <option v-for="p in patients" :key="p.id" :value="p.id">
                  {{ p.first_name }} {{ p.last_name }} (ID: {{ p.unique_id }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="encounter">Link to Encounter (Optional)</label>
              <select id="encounter" v-model="bill.encounter_id">
                <option value="">None</option>
                <option v-for="enc in encountersForSelectedPatient" :key="enc.id" :value="enc.id">
                  {{ enc.encounter_date }} - {{ enc.diagnosis || 'General Visit' }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="bill_date">Bill Date *</label>
              <input type="date" id="bill_date" v-model="bill.bill_date" required />
            </div>
            <div class="form-group">
              <label for="due_date">Due Date</label>
              <input type="date" id="due_date" v-model="bill.due_date" />
            </div>
          </div>

          <h4 class="section-title">Bill Items</h4>
          <div v-for="(item, index) in bill.items" :key="index" class="bill-item-row">
            <div class="form-group item-service">
              <label :for="`service-${index}`">Service/Item *</label>
              <select :id="`service-${index}`" v-model="item.service_item_id" @change="updateItemDetails(index)" required>
                <option disabled value="">Select Service</option>
                <option v-for="sItem in serviceItems" :key="sItem.id" :value="sItem.id">
                  {{ sItem.name }} ({{ formatCurrency(sItem.price) }})
                </option>
              </select>
            </div>
            <div class="form-group item-qty">
              <label :for="`qty-${index}`">Qty *</label>
              <input type="number" :id="`qty-${index}`" v-model.number="item.quantity" @input="updateItemDetails(index)" min="1" required />
            </div>
            <div class="form-group item-price">
              <label :for="`price-${index}`">Unit Price</label>
              <input type="number" :id="`price-${index}`" v-model.number="item.unit_price" disabled />
            </div>
            <div class="form-group item-total">
              <label>Line Total</label>
              <input type="text" :value="formatCurrency(item.total_price)" disabled />
            </div>
            <button type="button" @click="removeItem(index)" class="remove-item-btn">&times;</button>
          </div>
          <button type="button" @click="addItem" class="add-item-btn">+ Add Item</button>

          <div class="total-amount-section">
            <strong>Total Bill Amount: {{ formatCurrency(calculatedTotalAmount) }}</strong>
          </div>

          <div class="form-group notes-group">
            <label for="notes">Notes</label>
            <textarea id="notes" v-model="bill.notes" rows="2"></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Create' }} Bill</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type PropType, watch, computed } from 'vue';
import { type Bill, type BillItem, createBill, /* updateBill, */ fetchServiceItems as fetchBillingServiceItems } from '@/services/billingService';
import { type Patient, fetchPatients } from '@/services/patientService';
import { type Encounter, fetchEncounters } from '@/services/encounterService';
import store from '@/store';

interface ServiceItemForForm {
  id: string | number;
  name: string;
  price: number;
}

interface BillItemFormData extends Omit<BillItem, 'id' | 'bill_id' | 'service_name' | 'total_price'> {
  service_item_id: string | number;
  quantity: number;
  unit_price: number;
  total_price?: number; // Calculated client-side for display
}

export default defineComponent({
  name: 'CreateBillModal',
  props: {
    existingBill: {
      type: Object as PropType<Bill | null>,
      default: null,
    },
    targetPatientId: { type: [String, Number] as PropType<string | number | null>, default: null },
    targetEncounterId: { type: [String, Number] as PropType<string | number | null>, default: null },
  },
  emits: ['close', 'billCreated', 'billUpdated'],
  setup(props, { emit }) {
    const bill = ref<Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'paid_amount' | 'balance_due' | 'payments' | 'status' | 'items'> & { items: BillItemFormData[] }>({
      patient_id: props.targetPatientId || '',
      encounter_id: props.targetEncounterId || '',
      bill_date: new Date().toISOString().split('T')[0], // Default to today
      due_date: '',
      total_amount: 0, // Will be calculated
      notes: '',
      items: [],
    });

    const patients = ref<Patient[]>([]);
    const allEncounters = ref<Encounter[]>([]); // To store all encounters initially
    const encountersForSelectedPatient = ref<Encounter[]>([]);
    const serviceItems = ref<ServiceItemForForm[]>([]);
    const errorMessage = ref('');
    const isEditing = ref(false);
    const formTitle = ref('Create New Bill');

    const formatCurrency = (amount: number | undefined) => {
      if (amount === undefined || amount === null) return '0.00';
      return amount.toFixed(2);
    };

    const calculatedTotalAmount = computed(() => {
      return bill.value.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    });

    const loadInitialData = async () => {
      try {
        const token = store.state.token;
        if (!token) { errorMessage.value = 'Auth token missing.'; return; }
        patients.value = await fetchPatients(token);
        serviceItems.value = await fetchBillingServiceItems(token);
        allEncounters.value = await fetchEncounters(token); // Fetch all encounters

        if (props.targetPatientId) {
          bill.value.patient_id = props.targetPatientId;
          handlePatientSelection(); // Trigger filtering encounters
        }
        if (props.targetEncounterId && props.targetPatientId) {
            bill.value.encounter_id = props.targetEncounterId;
            // Patient should already be set if encounterId is provided
        }

      } catch (error: any) { errorMessage.value = `Failed to load data: ${error.message}`; }
    };

    const handlePatientSelection = () => {
      if (bill.value.patient_id) {
        encountersForSelectedPatient.value = allEncounters.value.filter(enc => enc.patient_id === bill.value.patient_id);
        // If currently selected encounter doesn't belong to new patient, reset it
        if (bill.value.encounter_id && !encountersForSelectedPatient.value.find(e => e.id === bill.value.encounter_id)) {
            bill.value.encounter_id = '';
        }
      } else {
        encountersForSelectedPatient.value = [];
        bill.value.encounter_id = '';
      }
    };

    const addItem = () => {
      bill.value.items.push({
        service_item_id: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      });
    };

    const removeItem = (index: number) => {
      bill.value.items.splice(index, 1);
    };

    const updateItemDetails = (index: number) => {
      const item = bill.value.items[index];
      const selectedService = serviceItems.value.find(s => s.id === item.service_item_id);
      if (selectedService) {
        item.unit_price = selectedService.price;
        item.total_price = item.quantity * selectedService.price;
      } else {
        item.unit_price = 0;
        item.total_price = 0;
      }
    };

    watch(() => props.existingBill, (newVal) => {
      if (newVal) {
        isEditing.value = true;
        formTitle.value = 'Edit Bill';
        // Map existingBill to the form model
        const { items, patient_name, ...billData } = newVal;
        bill.value = {
            ...billData,
            items: items.map(i => ({ 
                service_item_id: i.service_item_id, 
                quantity: i.quantity, 
                unit_price: i.unit_price, 
                total_price: i.total_price 
            })),
        };
        handlePatientSelection(); // To populate encounters for the patient
      } else {
        isEditing.value = false;
        formTitle.value = 'Create New Bill';
        // Reset form
        bill.value = {
          patient_id: props.targetPatientId || '',
          encounter_id: props.targetEncounterId || '',
          bill_date: new Date().toISOString().split('T')[0],
          due_date: '',
          total_amount: 0,
          notes: '',
          items: [],
        };
        if (props.targetPatientId) handlePatientSelection();
      }
    }, { immediate: true, deep: true });

    onMounted(() => {
      loadInitialData();
      if (!props.existingBill && bill.value.items.length === 0) {
        addItem(); // Start with one empty item row for new bills
      }
    });

    const handleSubmit = async () => {
      errorMessage.value = '';
      if (bill.value.items.length === 0) {
        errorMessage.value = 'Please add at least one bill item.';
        return;
      }
      if (bill.value.items.some(item => !item.service_item_id || item.quantity <= 0)) {
        errorMessage.value = 'All bill items must have a service selected and quantity greater than 0.';
        return;
      }

      const token = store.state.token;
      if (!token) { errorMessage.value = 'User not authenticated.'; return; }

      // Ensure items include service_name for the createBill payload
      const itemsWithServiceName = bill.value.items.map(item => {
        const service = serviceItems.value.find(s => s.id === item.service_item_id);
        return {
          ...item,
          service_name: service?.name || 'Unknown Service',
          total_price: item.total_price ?? 0, // Ensure total_price is always a number
        };
      });

      const billToSubmit = {
        ...bill.value,
        items: itemsWithServiceName, // Use items with service_name
        total_amount: calculatedTotalAmount.value, 
      };

      try {
        if (isEditing.value && props.existingBill?.id) {
          // const updated = await updateBill(props.existingBill.id, billToSubmit, token); // Assuming updateBill exists
          // emit('billUpdated', updated);
          alert('Update Bill functionality not yet implemented in dummy service.');
        } else {
          const newBill = await createBill(billToSubmit, token);
          emit('billCreated', newBill);
        }
        emit('close');
      } catch (error: any) { errorMessage.value = `Failed to save bill: ${error.message}`; }
    };

    return {
      bill,
      patients,
      allEncounters,
      encountersForSelectedPatient,
      serviceItems,
      errorMessage,
      handleSubmit,
      isEditing,
      formTitle,
      addItem,
      removeItem,
      updateItemDetails,
      formatCurrency,
      calculatedTotalAmount,
      handlePatientSelection,
    };
  },
});
</script>

<style scoped>
.create-bill-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  color: #111;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 850px; /* Wider for bill items */
  box-shadow: 0 8px 32px rgba(30,58,92,0.18);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-title {
  color: var(--primary-blue);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}
.bill-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden; /* Contains the scrollable area */
}
.form-scrollable-content {
  overflow-y: auto;
  padding: 0.5rem 1rem 0.5rem 0.5rem; /* Add padding, esp. right for scrollbar */
  margin-right: -1rem; /* Offset scrollbar padding */
  flex-grow: 1;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.top-grid {
  margin-bottom: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:disabled {
  background-color: #e9ecef;
  opacity: 0.7;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(30, 58, 92, 0.15);
}
.section-title {
  font-size: 1.1rem;
  color: var(--primary-blue);
  font-weight: 500;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e0e0e0;
}
.bill-item-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1.5fr 1.5fr auto; /* Adjusted for service, qty, price, total, remove_btn */
  gap: 0.8rem;
  align-items: flex-end; /* Align items to bottom of row for better label alignment */
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #eee;
}
.bill-item-row:last-of-type {
  border-bottom: none;
}
.item-service { grid-column: 1 / 2; }
.item-qty { grid-column: 2 / 3; }
.item-price { grid-column: 3 / 4; }
.item-total { grid-column: 4 / 5; }
.remove-item-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  height: fit-content; /* Align with input bottom */
  margin-bottom: 0.6rem; /* Align with input bottom padding */
}
.add-item-btn {
  background: var(--teal);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  width: fit-content;
}
.total-amount-section {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--primary-blue);
  text-align: right;
  padding-top: 1rem;
  border-top: 1px solid #ccc;
}
.notes-group textarea {
  min-height: 60px;
  resize: vertical;
}
.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.submit-btn, .cancel-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
.submit-btn { background: var(--primary-blue); color: var(--white); }
.submit-btn:hover { background: var(--teal); }
.cancel-btn { background: #ccc; color: #333; }
.cancel-btn:hover { background: #b0b0b0; }
.error-message { color: red; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
