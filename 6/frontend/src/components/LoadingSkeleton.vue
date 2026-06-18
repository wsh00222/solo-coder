<template>
  <div class="loading-skeleton">
    <div v-for="i in count" :key="i" class="skeleton-card card">
      <div class="skeleton-title"></div>
      <div class="skeleton-line skeleton-line-1"></div>
      <div class="skeleton-line skeleton-line-2"></div>
      <div class="skeleton-footer">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag skeleton-tag-2"></div>
        <div class="skeleton-date"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 5 }
})
</script>

<style scoped>
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  padding: 20px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 14px;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-line-1 { width: 90%; }
.skeleton-line-2 { width: 70%; }

.skeleton-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.skeleton-tag {
  width: 60px;
  height: 22px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-tag-2 { width: 48px; }

.skeleton-date {
  margin-left: auto;
  width: 100px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
