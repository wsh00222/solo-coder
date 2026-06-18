<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="pagination-btn"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>

    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" class="pagination-ellipsis">...</span>
      <button
        v-else
        :class="['pagination-btn', { active: p === page }]"
        @click="$emit('change', p)"
      >
        {{ p }}
      </button>
    </template>

    <button
      class="pagination-btn"
      :disabled="page >= totalPages"
      @click="$emit('change', page + 1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})

defineEmits(['change'])

const visiblePages = computed(() => {
  const { page, totalPages } = props
  const pages = []
  const delta = 1

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    pages.push(i)
  }

  if (page - delta > 2) pages.unshift('...')
  if (page + delta < totalPages - 1) pages.push('...')

  pages.unshift(1)
  if (totalPages > 1) pages.push(totalPages)

  const sorted = []
  for (const p of [1, '...l', page - delta, page - delta + 1, page - delta + 2, '...r', totalPages]) {
    if (p === '...l' && page - delta > 2) sorted.push('...')
    else if (p === '...r' && page + delta < totalPages - 1) sorted.push('...')
    else if (typeof p === 'number' && p >= 1 && p <= totalPages && !sorted.includes(p)) {
      if (p === 1 || p === totalPages || (p >= page - delta && p <= page + delta)) {
        sorted.push(p)
      }
    }
  }
  return sorted.length > 0 ? sorted : pages
})
</script>

<style scoped>
.pagination-ellipsis {
  padding: 0 4px;
  color: var(--text-muted);
}
</style>
