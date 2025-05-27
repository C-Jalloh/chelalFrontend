import { createRouter, createWebHistory, type RouteRecordRaw, type NavigationGuardNext, type RouteLocationNormalized, type RouteRecordNormalized } from 'vue-router';
import store from './store';

// Views
import LoginView from './views/LoginView.vue';

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
      
      { path: '', redirect: 'patients' } // Default child route for /app
    ],
  },
  // Catch-all for 404
  { 
    path: '/:catchAll(.*)', 
    name: 'NotFound',
    component: () => import('../src/views/NotFound.vue') // Assuming you have a NotFound.vue view
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const requiresAuth = to.matched.some((record: RouteRecordNormalized) => record.meta.requiresAuth);
  const token = store.state.token;

  if (requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
