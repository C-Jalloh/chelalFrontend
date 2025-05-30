<!-- Main layout with sidebar navigation and topbar -->
<template>
  <div class="bucket">
    <header class="topbar">
      <span>Chelal HMS</span>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </header>
    <div class="layout">
      <aside class="sidebar">
        <nav>
          <ul>
            <li><router-link to="/app/patients"><UserIcon class="icon-th sidebar-icon" /> Patients</router-link></li>
            <li><router-link to="/app/appointments"><CalendarDaysIcon class="icon-th sidebar-icon" /> Appointments</router-link></li>
            <li><router-link to="/app/encounters"><CalendarDaysIcon class="icon-th sidebar-icon" /> Encounters</router-link></li>
            <li><router-link to="/app/audit-logs">Audit Logs</router-link></li>
            <li><router-link to="/app/beds">Beds</router-link></li>
            <li><router-link to="/app/suppliers">Suppliers</router-link></li>
            <li><router-link to="/app/medication-categories">Medication Categories</router-link></li>
            <li><router-link to="/app/medications">Medications</router-link></li>
            <li><router-link to="/app/stock-batches">Stock Batches</router-link></li>
            <li><router-link to="/app/purchase-order-items">Purchase Order Items</router-link></li>
            <li><router-link to="/app/goods-received-notes-items">GRN Items</router-link></li>
            <li><router-link to="/app/sessions">Sessions</router-link></li>
            <li><router-link to="/app/tasks">Tasks</router-link></li>
            <li><router-link to="/app/insurance-details">Insurance Details</router-link></li>
            <li><router-link to="/app/stock-adjustments-service">Stock Adjustments (Service)</router-link></li>
            <li><router-link to="/app/note-templates">Note Templates</router-link></li>
            <li><router-link to="/app/prescriptions">Prescriptions</router-link></li>
            <li><router-link to="/app/billing">Billing</router-link></li>
            <li><router-link to="/app/pharmacy">Pharmacy Inventory</router-link></li> 
            <li><router-link to="/app/pharmacy/purchase-orders">Purchase Orders</router-link></li>
            <li><router-link to="/app/pharmacy/grns">Goods Received Notes</router-link></li> <!-- Add this link -->
            <li><router-link to="/app/pharmacy/dispensing">Dispensing Log</router-link></li> <!-- Add this link -->
            <li><router-link to="/app/pharmacy/adjustments">Stock Adjustments</router-link></li> <!-- Add this link -->
          </ul>
        </nav>
      </aside>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
import { CalendarDaysIcon, UserIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'MainLayout',
  components: {
    CalendarDaysIcon,
    UserIcon,
  },
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      store.commit('logout');
      router.push('/login');
    };

    return {
      handleLogout,
    };
  },
});
</script>

<style scoped>
.bucket {
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-width: 0;
  min-height: 100vh;
  height: 100vh;
  overflow-x: unset;
  overflow-y: unset;
  box-sizing: border-box;
}
.topbar {
  background: var(--white);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  z-index: 10;
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  flex-wrap: wrap;
}
.topbar span:first-child {
  color: var(--primary-blue);
  font-weight: bold;
  font-size: 1.2rem;
  word-break: break-word;
}
.layout {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  height: 100%;
  width: 100%;
  background: var(--primary-blue);
  flex: 1 1 0;
}
.sidebar {
  width: 300px;
  min-width: 300px;
  background: var(--sidebar-blue);
  color: var(--white);
  padding: 1rem 0;
  transition: transform 0.3s ease;
  min-height: 100vh;
  height: 100vh;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: auto;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
.sidebar a {
  color: var(--white);
  text-decoration: none;
  transition: color 0.2s;
}
.sidebar a.router-link-exact-active {
  font-weight: bold;
  color: var(--teal);
}
.main-content {
  flex: 1 1 0;
  background: var(--white);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto; /* Changed from overflow: hidden to allow vertical scrolling */
}
.logout-button {
  background-color: var(--teal);
  color: var(--white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 1rem;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-button:hover {
  background-color: var(--primary-blue);
}
.sidebar-icon {
  width: 1em !important;
  height: 1em !important;
  min-width: 1em !important;
  min-height: 1em !important;
  max-width: 1em !important;
  max-height: 1em !important;
  margin-right: 0.45em;
  vertical-align: middle;
}

@media (max-width: 900px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  .layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  .sidebar {
    width: 100%;
    height: auto;
    min-height: unset;
    position: relative;
    padding: 0.5rem 0;
  }
  .sidebar ul {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .sidebar li {
    margin: 0;
    padding: 0.5rem 0.5rem;
  }
  .main-content {
    min-height: 60vh;
    height: auto;
  }
}
@media (max-width: 600px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  .sidebar ul {
    flex-direction: column;
    align-items: flex-start;
  }
  .sidebar li {
    width: 100%;
    padding: 0.5rem 1rem;
  }
  .main-content {
    padding: 0.5rem;
    min-height: 50vh;
    height: auto;
  }
}
</style>
