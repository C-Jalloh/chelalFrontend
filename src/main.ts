import { createApp } from 'vue';
import './style.css';
import './components/Modals/GlobalModalStyles.css'; // Import global modal styles
import './assets/edit-appointment-styles.css'; // Import specific edit appointment modal styles
import App from './App.vue';
import router from './router';
import store from './store';

createApp(App).use(router).use(store).mount('#app');
