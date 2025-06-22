import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import store from './store';

// Views
import LoginView from '../src/views/LoginView.vue';
import LandingPage from './views/LandingPage.vue';
import RegisterView from './views/RegisterView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/app',
    component: () => import('./components/MainLayout.vue'), // Lazy load MainLayout
    meta: { requiresAuth: true },
    children: [
      { path: 'patients', name: 'Patients', component: () => import('./views/PatientsView.vue'), meta: { roles: ['Admin', 'Receptionist', 'Doctor', 'Nurse'] } },
      { path: 'appointments', name: 'Appointments', component: () => import('../src/views/AppointmentsView.vue'), meta: { roles: ['Admin', 'Receptionist', 'Doctor', 'Nurse'] } },
      { path: 'encounters', name: 'Encounters', component: () => import('../src/views/EncountersView.vue'), meta: { roles: ['Admin', 'Doctor', 'Nurse'] } },
      { path: 'prescriptions', name: 'Prescriptions', component: () => import('../src/views/PrescriptionsView.vue'), meta: { roles: ['Admin', 'Doctor', 'Nurse'] } },
      { path: 'billing', name: 'Billing', component: () => import('./views/BillingView.vue'), meta: { roles: ['Admin', 'Receptionist'] } },
      { path: 'pharmacy', name: 'PharmacyInventory', component: () => import('./views/PharmacyInventoryView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'pharmacy/purchase-orders', name: 'PurchaseOrders', component: () => import('./views/PurchaseOrdersView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'pharmacy/grns', name: 'GoodsReceivedNotes', component: () => import('./views/GoodsReceivedNotesView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'pharmacy/dispensing', name: 'DispensingLog', component: () => import('./views/DispensingLogView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'pharmacy/adjustments', name: 'StockAdjustments', component: () => import('./views/StockAdjustmentsView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'service-catalog', name: 'ServiceCatalog', component: () => import('./views/ServiceCatalogView.vue'), meta: { roles: ['Admin'] } },
      { path: 'audit-logs', name: 'AuditLogs', component: () => import('./views/ComingSoon.vue'), meta: { roles: ['Admin'] } },
      { path: 'beds', name: 'Beds', component: () => import('./views/BedsView.vue'), meta: { roles: ['Admin', 'Receptionist'] } },
      { path: 'suppliers', name: 'Suppliers', component: () => import('./views/SuppliersView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'medication-categories', name: 'MedicationCategories', component: () => import('./views/MedicationCategoriesView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'medications', name: 'Medications', component: () => import('./views/MedicationServiceView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'stock-batches', name: 'StockBatches', component: () => import('./views/StockBatchesView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'purchase-order-items', name: 'PurchaseOrderItems', component: () => import('./views/PurchaseOrderItemsView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'goods-received-notes-items', name: 'GoodsReceivedNotesItems', component: () => import('./views/GoodsReceivedNotesItemsView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'sessions', name: 'Sessions', component: () => import('./views/SessionsView.vue'), meta: { roles: ['Admin'] } },
      { path: 'tasks', name: 'Tasks', component: () => import('./views/TasksView.vue'), meta: { roles: ['Admin', 'Doctor'] } },
      { path: 'insurance-details', name: 'InsuranceDetails', component: () => import('./views/InsuranceDetailsView.vue'), meta: { roles: ['Admin', 'Receptionist'] } },
      { path: 'stock-adjustments-service', name: 'StockAdjustmentsService', component: () => import('./views/StockAdjustmentsServiceView.vue'), meta: { roles: ['Admin', 'Pharmacist'] } },
      { path: 'note-templates', name: 'NoteTemplates', component: () => import('./views/NoteTemplatesView.vue'), meta: { roles: ['Admin', 'Doctor'] } },
      { path: 'appointment-notifications', name: 'AppointmentNotifications', component: () => import('./views/AppointmentNotificationsView.vue'), meta: { roles: ['Admin', 'Receptionist', 'Doctor'] } },
      { path: 'access-denied', name: 'AccessDenied', component: () => import('./views/AccessDeniedView.vue') },
      { path: 'dashboard', name: 'Dashboard', component: () => import('./views/DashboardView.vue') },
      { path: 'notifications', name: 'Notifications', component: () => import('./views/NotificationsView.vue'), meta: { requiresAuth: true } },
      { path: 'profile', name: 'Profile', component: () => import('./views/ProfileView.vue'), meta: { requiresAuth: true } },
      { path: 'settings', name: 'Settings', component: () => import('./views/SettingsView.vue'), meta: { requiresAuth: true } },
      { path: '', redirect: 'dashboard' } // Default child route for /app
    ],
  },
  // Catch-all for 404 - redirect to login
  { 
    path: '/:catchAll(.*)', 
    name: 'NotFound',
    redirect: '/login' // Redirect to login page
    // component: () => import('../src/views/NotFound.vue') // Original component
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const allowedRoles = to.meta && to.meta.roles ? to.meta.roles : null;
  const isAuthenticated = store.getters.isAuthenticated;
  const userRole = store.getters.getUserRole;

  if (requiresAuth) {
    if (isAuthenticated) {
      // If route has role restrictions, check them
      if (Array.isArray(allowedRoles) && (!userRole || !allowedRoles.includes(userRole))) {
        next('/access-denied');
      } else {
        next();
      }
    } else {
      // Token is missing or expired, try to refresh
      const refreshToken = store.getters.getRefreshToken;
      if (refreshToken) {
        try {
          // The requestFn is a placeholder as we just want to trigger the refresh logic.
          // If successful, attemptRefreshAndRetry updates the token in the store.
          await store.dispatch('attemptRefreshAndRetry', () => Promise.resolve());
          
          // After refresh attempt, check auth status again
          if (store.getters.isAuthenticated) {
            next(); // Token refreshed successfully, proceed
          } else {
            // Refresh failed to make user authenticated (e.g. refresh token was also invalid)
            next('/login');
          }
        } catch (error) {
          // This catches errors from attemptRefreshAndRetry if it throws
          console.error('Router guard: Refresh attempt failed', error);
          next('/login'); // Redirect to login on any error during refresh process
        }
      } else {
        // No refresh token available, redirect to login
        next('/login');
      }
    }
  } else {
    // Route does not require authentication
    next();
  }
});

export default router;
