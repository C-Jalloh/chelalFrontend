<template>
  <div class="dashboard-card standardized-card">
    <span class="card-value">
      <slot name="value">--</slot>
    </span>
    <span class="card-label">
      <slot name="label">Label</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
// Simple reusable dashboard card
</script>

<style scoped>
.dashboard-card.standardized-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.13), 0 1.5px 6px rgba(30, 58, 92, 0.10);
  border: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  min-width: 440px;
  min-height: 100px;
  max-height: 120px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 !important;
  transition: box-shadow 0.22s cubic-bezier(.4,2,.6,1), transform 0.18s cubic-bezier(.4,2,.6,1);
  cursor: pointer;
}
.dashboard-card.standardized-card:hover, 
.dashboard-card.standardized-card:focus, 
.dashboard-card.standardized-card:active {
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.18), 0 4px 16px rgba(30, 58, 92, 0.13);
  transform: translateY(-2px) scale(1.025);
  z-index: 2;
}
.card-value {
  color: #1e3a8a;
  font-size: 2.5rem;
  font-weight: 700;
}
.card-label {
  color: #374151;
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
