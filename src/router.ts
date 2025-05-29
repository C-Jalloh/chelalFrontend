import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import store from './store';

// Views
import LoginView from '../src/views/LoginView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/patients',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/app',
    component: () => import('./components/MainLayout.vue'), // Lazy load MainLayout
    meta: { requiresAuth: true },
    children: [
      { path: 'patients', name: 'Patients', component: () => import('./views/PatientsView.vue') },
      { path: 'appointments', name: 'Appointments', component: () => import('../src/views/AppointmentsView.vue') },
      { path: 'encounters', name: 'Encounters', component: () => import('../src/views/EncountersView.vue') },
      { path: 'prescriptions', name: 'Prescriptions', component: () => import('../src/views/PrescriptionsView.vue') },
      { path: 'billing', name: 'Billing', component: () => import('@/views/BillingView.vue') },
      // Pharmacy Routes
      { path: 'pharmacy', name: 'PharmacyInventory', component: () => import('@/views/PharmacyInventoryView.vue') },
      { path: 'pharmacy/purchase-orders', name: 'PurchaseOrders', component: () => import('@/views/PurchaseOrdersView.vue') },
      { path: 'pharmacy/grns', name: 'GoodsReceivedNotes', component: () => import('@/views/GoodsReceivedNotesView.vue') },
      { path: 'pharmacy/dispensing', name: 'DispensingLog', component: () => import('@/views/DispensingLogView.vue') },
      { path: 'pharmacy/adjustments', name: 'StockAdjustments', component: () => import('@/views/StockAdjustmentsView.vue') },
      { path: 'service-catalog', name: 'ServiceCatalog', component: () => import('./views/ServiceCatalogView.vue') },
      { path: 'audit-logs', name: 'AuditLogs', component: () => import('./views/AuditLogsView.vue') }, // Use relative path for AuditLogsView.vue
      
      { path: '', redirect: 'patients' } // Default child route for /app
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

router.beforeEach(async (to, _from, next) => { // Make the guard async
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated; // Uses isTokenExpired

  if (requiresAuth) {
    if (isAuthenticated) {
      next(); // Token is valid and user is authenticated
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
