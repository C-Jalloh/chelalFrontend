<!-- Main layout with sidebar navigation and topbar -->
<template>
  <div class="bucket">
    <Navbar @show-profile-modal="showProfileModal = true" />
    <ProfileModal :show="showProfileModal" @close="showProfileModal = false" />
    <div class="layout" :class="{ 'dark': isDarkMode }">
      <aside v-if="showSidebar" class="sidebar" :class="{ 'dark': isDarkMode }">
        <nav>
          <ul>
            <li>
              <router-link to="/app/dashboard">
                <svg class="icon-th sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 0.5em; width: 1.2em; height: 1.2em;"><rect x="3" y="13" width="4" height="8"/><rect x="9" y="9" width="4" height="12"/><rect x="15" y="5" width="4" height="16"/></svg>
                Dashboard
              </router-link>
            </li>
            <li v-if="canView(['Admin', 'Receptionist', 'Doctor', 'Nurse'])">
              <router-link to="/app/patients">
                <UserIcon class="icon-th sidebar-icon" /> Patients
              </router-link>
            </li>
            <li v-if="canView(['Admin', 'Receptionist', 'Doctor', 'Nurse'])">
              <router-link to="/app/appointments">
                <CalendarDaysIcon class="icon-th sidebar-icon" /> Appointments
              </router-link>
            </li>
            <li v-if="canView(['Admin', 'Doctor', 'Nurse'])">
              <router-link to="/app/encounters">
                <CalendarDaysIcon class="icon-th sidebar-icon" /> Encounters
              </router-link>
            </li>
            <li v-if="canView(['Admin', 'Doctor', 'Nurse'])">
              <router-link to="/app/prescriptions">
                <ClipboardDocumentListIcon class="icon-th sidebar-icon" /> Prescriptions
              </router-link>
            </li>
            <li v-if="canView(['Admin', 'Pharmacist'])">
              <router-link to="/app/pharmacy">
                <ClipboardDocumentListIcon class="icon-th sidebar-icon" /> Pharmacy Inventory
              </router-link>
            </li>
            <li>
              <router-link to="/app/notifications">
                <svg class="icon-th sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 0.5em; width: 1.2em; height: 1.2em;"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                Notifications
              </router-link>
            </li>
          </ul>
          <hr />
          <ul>
            <li v-if="canView(['Admin', 'Receptionist'])"><router-link to="/app/beds">Beds</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/suppliers">Suppliers</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/medication-categories">Medication Categories</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/medications">Medications</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/stock-batches">Stock Batches</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/purchase-order-items">Purchase Order Items</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/goods-received-notes-items">GRN Items</router-link></li>
            <li v-if="canView(['Admin'])"><router-link to="/app/sessions">Sessions</router-link></li>
            <li v-if="canView(['Admin', 'Doctor'])"><router-link to="/app/tasks">Tasks</router-link></li>
            <li v-if="canView(['Admin', 'Receptionist'])"><router-link to="/app/insurance-details">Insurance Details</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/stock-adjustments-service">Stock Adjustments (Service)</router-link></li>
            <li v-if="canView(['Admin', 'Doctor'])"><router-link to="/app/note-templates">Note Templates</router-link></li>
            <li v-if="canView(['Admin', 'Receptionist'])"><router-link to="/app/billing">Billing</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/pharmacy/purchase-orders">Purchase Orders</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/pharmacy/grns">Goods Received Notes</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/pharmacy/dispensing">Dispensing Log</router-link></li>
            <li v-if="canView(['Admin', 'Pharmacist'])"><router-link to="/app/pharmacy/adjustments">Stock Adjustments</router-link></li>
            <li v-if="canView(['Admin', 'Receptionist', 'Doctor'])"><router-link to="/app/appointment-notifications">Appointment Notifications</router-link></li>
            <li>
              <router-link to="/app/notifications">
                <svg class="icon-th sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 0.5em; width: 1.2em; height: 1.2em;"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                Notifications
              </router-link>
            </li>
            <li><router-link to="/app/audit-logs">Audit Logs</router-link></li>
          </ul>
        </nav>
      </aside>
      <div class="main-content" :class="{ 'dark': isDarkMode }">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';
import { CalendarDaysIcon, UserIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline';
import LogoutButton from '@/components/buttons/LogoutButton.vue';
import ProfileModal from '@/components/ProfileModal.vue';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    CalendarDaysIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    LogoutButton,
    ProfileModal,
    Navbar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userRole = computed(() => store.getters.getUserRole);
    const showProfileModal = ref(false);
    const user = computed(() => store.state.user);
    const isDarkMode = ref(false);

    // Check localStorage or system preference on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        isDarkMode.value = saved === 'dark';
      } else {
        isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.documentElement.classList.toggle('dark', isDarkMode.value);
    }

    const handleLogout = () => {
      store.commit('logout');
      router.push('/login');
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDarkMode.value);
    };

    // Role-based menu visibility
    const canView = (roles: string[]) => {
      if (!userRole.value) return false;
      return roles.includes(userRole.value);
    };

    // Always show the sidebar for all /app/* routes
    const showSidebar = true;

    return {
      handleLogout,
      userRole,
      canView,
      showSidebar,
      showProfileModal,
      user,
      toggleTheme,
      isDarkMode,
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
.topbar, .navbar-logo, .topbar-actions, .theme-toggle-btn {
  display: none !important;
}
.layout {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  height: 100%;
  width: calc(100vw - 300px); /* Fix: prevent overflow by subtracting sidebar width */
  background: var(--primary-blue);
  flex: 1 1 0;
  margin-left: 300px; /* width of sidebar */
  box-sizing: border-box;
}
.layout.dark {
  background: var(--primary-blue);
}
.dashboard-no-sidebar {
  margin-left: 0 !important;
  width: 100vw !important;
}
.sidebar {
  width: 300px;
  min-width: 300px;
  background: var(--sidebar-blue);
  color: var(--white);
  padding: 1rem 0;
  transition: transform 0.3s ease;
  position: fixed;
  top: 56px; /* height of .topbar, adjust if needed */
  left: 0;
  bottom: 0;
  height: calc(100vh - 56px); /* fill below topbar */
  overflow-y: auto;
  overflow-x: auto;
  z-index: 100;
}
.sidebar.dark {
  background: var(--primary-blue);
  color: var(--text-contrast);
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  margin: 1rem 0;
  padding-left: 0;
  text-align: left;
}
.sidebar a {
  color: var(--white);
  text-decoration: none;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10px;
  margin-left: 10px;
}
.sidebar a.router-link-exact-active {
  font-weight: bold;
  color: var(--teal);
}
.sidebar.dark a {
  color: var(--text-contrast);
}
.sidebar.dark a.router-link-exact-active {
  color: var(--teal);
}
.main-content {
  flex: 1 1 0;
  background: var(--white);
  color: var(--text-dark);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
.main-content.dark {
  background: var(--primary-blue);
  color: var(--text-contrast);
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
.navbar-logo {
  height: 2.5rem;
  width: 2.5rem;
  margin-right: 1rem;
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
