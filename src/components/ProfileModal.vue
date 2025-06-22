<template>
  <div v-if="show">
    <div class="profile-modal-overlay" @click="$emit('close')"></div>
    <div class="profile-modal-dropdown" tabindex="0">
      <div class="profile-modal-content">
        <div v-if="user" class="profile-user-info">
          <div class="profile-avatar">
            <img v-if="user.profile_image" :src="user.profile_image" alt="User avatar" />
            <img v-else src="/placeholder-user.png" alt="User avatar" />
          </div>
          <div class="profile-user-details">
            <div class="profile-user-name">{{ user.first_name || user.username || user.email }}</div>
            <div class="profile-user-email">{{ user.email }}</div>
          </div>
        </div>
        <div class="profile-actions-list">
          <button class="profile-action-btn" @click="goToSettings">
            <span class="profile-action-icon">⚙️</span> My Settings
          </button>
          <button class="profile-action-btn" @click="goToNotifications">
            <span class="profile-action-icon">🔔</span> Notifications
          </button>
          <button class="profile-action-btn logout-btn" @click="logout">
            <span class="profile-action-icon">🚪</span> Log Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);
const store = useStore();
const router = useRouter();
const user = computed(() => store.state.user);
const token = computed(() => store.state.token);

const logout = () => {
  store.commit('logout');
  emit('close');
  router.push('/login');
};

const goToSettings = () => {
  emit('close');
  router.push('/app/settings');
};

const goToNotifications = () => {
  emit('close');
  router.push('/app/notifications');
};

defineExpose({
  user,
  logout,
  goToSettings,
  goToNotifications
});
</script>

<style scoped>
.profile-modal-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 199;
}
.profile-modal-dropdown {
  position: absolute;
  top: 3.5rem; /* below the topbar/profile icon */
  right: 0.5rem; /* Moved modal further to the right (closer to edge) */
  z-index: 200;
  background: transparent;
}
.profile-modal-content {
  background: var(--white);
  color: var(--text-dark);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  width: 240px; /* Reduced width */
  display: flex;
  flex-direction: column;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  outline: none;
}
html.dark .profile-modal-content,
:root.dark .profile-modal-content {
  background: var(--primary-blue);
  color: var(--text-contrast);
  box-shadow: 0 4px 16px rgba(30,58,92,0.45);
}

.profile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e0e7ef;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-user-details {
  display: flex;
  flex-direction: column;
}
.profile-user-name {
  font-weight: 600;
  color: #1e3a8a;
  font-size: 1.1rem;
}
html.dark .profile-user-name {
  color: var(--teal);
}

.profile-user-email {
  color: #64748b;
  font-size: 0.97rem;
}
html.dark .profile-user-email {
  color: #b0b8c1;
}
.font-semibold { font-weight: 600; }
.mb-3 { margin-bottom: 1rem; }
.profile-actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.profile-action-btn {
  display: flex;
  align-items: center;
  gap: 0.7em;
  background: #f3f4f6;
  color: #222;
  border: none;
  border-radius: 0.4rem;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
html.dark .profile-action-btn {
  background: #23272f;
  color: var(--text-contrast);
}

.profile-action-btn:hover {
  background: #e0e7ef;
  color: #2563eb;
}
html.dark .profile-action-btn:hover {
  background: var(--teal);
  color: var(--text-contrast-inverse);
}

.logout-btn {
  background: #ef4444;
  color: #fff;
}
html.dark .logout-btn {
  background: #b91c1c;
  color: #fff;
}
.profile-modal-error {
  color: #dc2626;
  margin-top: 1rem;
  text-align: center;
}
</style>
