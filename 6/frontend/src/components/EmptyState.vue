<template>
  <div class="empty-state">
    <svg v-if="type === 'no-notes'" viewBox="0 0 200 200" fill="none">
      <rect x="40" y="30" width="120" height="140" rx="8" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2" />
      <rect x="55" y="55" width="90" height="8" rx="4" fill="var(--primary)" opacity="0.6" />
      <rect x="55" y="75" width="70" height="6" rx="3" fill="#cbd5e1" />
      <rect x="55" y="88" width="80" height="6" rx="3" fill="#cbd5e1" />
      <rect x="55" y="101" width="60" height="6" rx="3" fill="#cbd5e1" />
      <rect x="55" y="130" width="50" height="20" rx="4" fill="var(--primary)" opacity="0.3" />
      <circle cx="160" cy="60" r="18" fill="var(--success)" opacity="0.2" />
      <path d="M154 60l4 4 8-8" stroke="var(--success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </svg>

    <svg v-else viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="90" r="50" fill="#f1f5f9" />
      <path d="M80 85l-5 5-15-15" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <circle cx="85" cy="78" r="4" fill="var(--text-muted)" />
      <circle cx="115" cy="78" r="4" fill="var(--text-muted)" />
      <path d="M85 100 Q100 90 115 100" stroke="var(--text-muted)" stroke-width="3" stroke-linecap="round" fill="none" />
      <rect x="60" y="150" width="80" height="30" rx="6" fill="#f1f5f9" />
      <text x="100" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="12">?</text>
    </svg>

    <h3>{{ title }}</h3>
    <p>{{ description }}</p>

    <div v-if="type === 'no-notes'">
      <router-link to="/new" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        创建第一篇笔记
      </router-link>
    </div>

    <button v-else class="btn btn-secondary" @click="$emit('clear')">
      清除筛选条件
    </button>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'no-results',
    validator: (v) => ['no-notes', 'no-results'].includes(v)
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})

defineEmits(['clear'])
</script>
