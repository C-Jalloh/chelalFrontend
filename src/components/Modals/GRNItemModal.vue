<template>
  <div class="grnitem-modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">{{ isEditing ? 'Edit GRN Item' : 'Add GRN Item' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="medication_item_id">Medication Item *</label>
          <input id="medication_item_id" v-model="item.medication_item_id" required />
        </div>
        <div class="form-group">
          <label for="batch_number">Batch Number *</label>
          <input id="batch_number" v-model="item.batch_number" required />
        </div>
        <div class="form-group">
          <label for="expiry_date">Expiry Date *</label>
          <input id="expiry_date" type="date" v-model="item.expiry_date" required />
        </div>
        <div class="form-group">
          <label for="quantity_received">Quantity Received *</label>
          <input id="quantity_received" type="number" v-model.number="item.quantity_received" min="1" required />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEditing ? 'Update' : 'Create' }}</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { createGRNItem, updateGRNItem } from '../services/grnItemService';

const props = defineProps({
  existingItem: { type: Object, default: undefined },
});
const emit = defineEmits(['close', 'itemCreated', 'itemUpdated']);

const isEditing = ref(!!props.existingItem);
const item = ref(props.existingItem ? { ...props.existingItem } : { medication_item_id: '', batch_number: '', expiry_date: '', quantity_received: 1 });
const errorMessage = ref('');

watch(() => props.existingItem, (newVal) => {
  isEditing.value = !!newVal;
  item.value = newVal ? { ...newVal } : { medication_item_id: '', batch_number: '', expiry_date: '', quantity_received: 1 };
});

const handleSubmit = async () => {
  errorMessage.value = '';
  try {
    const token = localStorage.getItem('token') || '';
    if (isEditing.value && item.value.id) {
      const updated = await updateGRNItem(item.value.id, item.value, token);
      emit('itemUpdated', updated.data);
    } else {
      const created = await createGRNItem(item.value, token);
      emit('itemCreated', created.data);
    }
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save item.';
  }
};
</script>

<style scoped>
.grnitem-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: #fff; color: #111; padding: 2rem 2.5rem; border-radius: 12px; min-width: 350px; max-width: 400px; box-shadow: 0 8px 32px rgba(30,58,92,0.18); }
.modal-title { color: var(--primary-blue); font-weight: 600; margin-bottom: 1.5rem; text-align: center; font-size: 1.3rem; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; color: #333; font-size: 0.9rem; }
.form-group input { padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
.form-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0; padding-top: 1rem; border-top: 1px solid #eee; }
.submit-btn, .cancel-btn { padding: 0.7rem 1.5rem; border-radius: 4px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; border: none; }
.submit-btn { background: var(--primary-blue); color: var(--white); }
.submit-btn:hover { background: var(--teal); }
.cancel-btn { background: #ccc; color: #333; }
.cancel-btn:hover { background: #b0b0b0; }
.error-message { color: red; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
