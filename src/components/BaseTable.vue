<!-- TODO: All tables should use this component for structure, sorting, and actions for visual consistency. -->
<template>
  <div class="base-table-wrapper">
    <table class="base-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" @click="col.sortable ? sortBy(col.key) : null" :class="{sortable: col.sortable}">
            <span v-if="col.icon" class="icon-th base-table-header-icon"><component :is="col.icon" /></span>
            {{ col.label }}
            <span v-if="col.sortable && sortKey === col.key">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedData" :key="row[idKey]" @click="onRowClick(row)" class="table-row">
          <td v-for="col in columns" :key="col.key">
            <slot :name="col.key" :row="row">
              <template v-if="typeof col.render === 'function'">
                <span v-html="col.render(row)"></span>
              </template>
              <template v-else>
                {{ row[col.key] }}
              </template>
            </slot>
          </td>
          <td class="actions-cell" @click.stop>
            <EditButton @click="$emit('edit', row)" style="margin-right:0.5em;" />
            <DeleteButton @click="$emit('delete', row)" />
          </td>
        </tr>
        <tr v-if="paginatedData.length === 0">
          <td :colspan="columns.length + 1" class="empty-row">No data available.</td>
        </tr>
      </tbody>
    </table>
    <div class="pagination-controls" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    <template v-if="showModal">
      <BaseViewModal
        :entry="selectedEntry"
        :columns="columns"
        @close="showModal = false"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue';
import EditButton from './buttons/EditButton.vue';
import DeleteButton from './buttons/DeleteButton.vue';
import BaseViewModal from './BaseViewModal.vue';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  icon?: any; // Allow icon property for columns
}

export default defineComponent({
  name: 'BaseTable',
  components: {
    EditButton,
    DeleteButton,
    BaseViewModal,
  },
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true,
    },
    data: {
      type: Array as PropType<any[]>,
      required: true,
    },
    idKey: {
      type: String,
      default: 'id',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
  },
  setup(props) {
    const currentPage = ref(1);
    const sortKey = ref('');
    const sortOrder = ref<'asc' | 'desc'>('asc');
    const showModal = ref(false);
    const selectedEntry = ref<any>(null);

    const sortedData = computed(() => {
      if (!sortKey.value) return props.data;
      return [...props.data].sort((a, b) => {
        if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === 'asc' ? -1 : 1;
        if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    });

    const totalPages = computed(() => Math.ceil(sortedData.value.length / props.pageSize));
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize;
      return sortedData.value.slice(start, start + props.pageSize);
    });

    function sortBy(key: string) {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    }
    function prevPage() {
      if (currentPage.value > 1) currentPage.value--;
    }
    function nextPage() {
      if (currentPage.value < totalPages.value) currentPage.value++;
    }
    function onRowClick(row: any) {
      selectedEntry.value = row;
      showModal.value = true;
    }

    return {
      currentPage,
      totalPages,
      paginatedData,
      sortKey,
      sortOrder,
      sortBy,
      prevPage,
      nextPage,
      showModal,
      selectedEntry,
      onRowClick,
    };
  },
});
</script>

<style scoped>
.base-table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(30,58,92,0.10);
  padding: 1.5rem 1rem;
  margin-bottom: 2rem;
  color: var(--text-dark);
}
html.dark .base-table-wrapper {
  background: var(--primary-blue);
  color: var(--text-contrast);
}

.base-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: hsl(var(--font-color-primary));
  background: hsl(var(--background));
  border-radius: 0.75rem;
  overflow: hidden;
  font-size: 1rem;
  color: var(--text-dark);
}
html.dark .base-table {
  background: #23272f;
  color: var(--text-contrast);
}

.base-table th, .base-table td {
  border-color: #e0e0e0;
}
html.dark .base-table th, html.dark .base-table td {
  border-color: #374151;
}

.base-table th {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: hsl(var(--font-color-primary));
  background: hsl(var(--background-alt));
}
html.dark .base-table th {
  background: #23272f;
  color: var(--teal);
}

.base-table td {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: hsl(var(--font-color-primary));
}
html.dark .base-table tr {
  background: #23272f;
}

.empty-row {
  text-align: center;
  color: hsl(var(--font-color-muted));
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  padding: 2rem 0;
}
html.dark .empty-row {
  color: #b0b8c1;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  background: var(--light-gray);
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(30,58,92,0.10);
  padding: 1rem 2.5rem;
}
html.dark .pagination-controls {
  background: #23272f;
  border-color: #374151;
}

.pagination-controls button {
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  border-radius: 0.375rem;
  padding: 0.7rem 2.2rem;
  /* Increased padding for bigger buttons */
  cursor: pointer;
  font-weight: 600;
  font-size: 1.18rem;
  /* Increased font size for bigger buttons */
  transition: background 0.2s;
}
html.dark .pagination-controls button {
  background: var(--teal);
  color: var(--text-contrast-inverse);
}

.pagination-controls button:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--white);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(30,58,92,0.18);
  padding: 2rem;
  min-width: 320px;
  max-width: 90vw;
  color: var(--text-dark);
}
html.dark .modal-content {
  background: var(--primary-blue);
  color: var(--text-contrast);
}

.modal-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.modal-label {
  font-weight: 500;
  color: #1e3a8a;
  width: 40%;
  padding-right: 1rem;
}
.close-btn {
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  float: right;
  margin-top: 1rem;
}
.actions-cell {
  display: flex;
  gap: 0.5em;
  align-items: center;
  justify-content: flex-start;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
}
.base-table-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin-right: 0.35em;
  width: 1em;
  height: 1em;
  min-width: 1em;
  min-height: 1em;
  max-width: 1em;
  max-height: 1em;
}
</style>
