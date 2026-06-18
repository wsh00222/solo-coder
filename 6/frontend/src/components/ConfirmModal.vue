<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal" @click.stop>
        <div v-if="title" class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="btn-icon btn-ghost" @click="$emit('cancel')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <slot>{{ message }}</slot>
        </div>
        <div v-if="showActions" class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button
            :class="['btn', confirmDanger ? 'btn-danger' : 'btn-primary']"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            <span v-if="loading" class="btn-loading"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  confirmDanger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 20px 24px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
}

.btn-loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  margin-right: 6px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
