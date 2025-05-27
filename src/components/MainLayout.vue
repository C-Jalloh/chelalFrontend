<!-- Main layout with sidebar navigation and topbar -->
<template>
  <div class="bucket">
    <div class="layout">
      <aside class="sidebar">
        <nav>
          <ul>
            <li><router-link to="/patients">Patients</router-link></li>
            <li><router-link to="/appointments">Appointments</router-link></li>
            <li><router-link to="/encounters">Encounters</router-link></li>
            <li><router-link to="/prescriptions">Prescriptions</router-link></li>
            <li><router-link to="/billing">Billing</router-link></li>
            <li><router-link to="/pharmacy">Pharmacy Inventory</router-link></li> 
            <li><router-link to="/pharmacy/purchase-orders">Purchase Orders</router-link></li>
            <li><router-link to="/pharmacy/grn">Goods Received Notes</router-link></li> <!-- Add this link -->
            <li><router-link to="/pharmacy/dispensing-log">Dispensing Log</router-link></li> <!-- Add this link -->
            <li><router-link to="/pharmacy/stock-adjustments">Stock Adjustments</router-link></li> <!-- Add this link -->
          </ul>
        </nav>
      </aside>
      <div class="main-content">
        <header class="topbar">
          <span>Chelal HMS</span>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </header>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';

export default defineComponent({
  name: 'MainLayout',
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
  height: 100vh;
  min-height: 100vh;
  min-width: 100vw;
  overflow: hidden;
}
.layout {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  height: 100%;
  width: 100%;
  background: var(--primary-blue);
}
.sidebar {
  width: 220px;
  background: var(--sidebar-blue);
  color: var(--white);
  padding: 1rem 0;
  transition: transform 0.3s ease;
  min-height: 100vh;
  height: 100%;
  flex-shrink: 0;
  overflow: auto;
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
.topbar {
  background: var(--white);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.topbar span:first-child {
  color: var(--primary-blue);
  font-weight: bold;
  font-size: 1.2rem;
}
.status-indicator {
  font-size: 0.95rem;
  color: var(--teal);
}
.logout-button {
  background-color: var(--teal);
  color: var(--white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.logout-button:hover {
  background-color: var(--primary-blue);
}

@media (max-width: 900px) {
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
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 1rem;
  }
}
</style>
