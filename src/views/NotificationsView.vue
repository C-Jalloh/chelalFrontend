<template>
  <div class="notifications-view-bg">
    <div class="notifications-list-container">
      <NotificationsList />
    </div>
  </div>
</template>

<script lang="ts">
import NotificationsList from '../components/NotificationsList.vue';
export default {
  name: 'NotificationsView',
  components: { NotificationsList },
};
</script>

<style scoped>
.notifications-view-bg {
  background: #1e3a5c;
  color: #111;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}
.notifications-list-container {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
