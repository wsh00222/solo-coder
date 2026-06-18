<template>
  <div class="note-card card">
    <div class="note-card-header">
      <router-link :to="`/notes/${note.id}`" class="note-title" @click="$emit('navigate')">
        {{ note.title }}
      </router-link>
      <button
        class="btn-icon btn-ghost copy-btn"
        title="复制标题"
        @click.stop="handleCopy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>
    <p class="note-summary">{{ note.summary }}</p>
    <div class="note-footer">
      <div v-if="note.tags && note.tags.length" class="note-tags">
        <span
          v-for="tag in note.tags"
          :key="tag.id"
          class="tag tag-sm"
          :class="{ active: selectedTag === tag.name }"
          @click.stop="$emit('tag-click', tag.name)"
        >
          {{ tag.name }}
        </span>
      </div>
      <div class="note-meta">
        <span class="meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {{ formattedUpdatedAt }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { formatDate, copyToClipboard } from '../utils'

const props = defineProps({
  note: { type: Object, required: true },
  selectedTag: { type: String, default: '' }
})

const emit = defineEmits(['navigate', 'tag-click', 'copied'])

const toast = inject('toast')

const formattedUpdatedAt = computed(() => formatDate(props.note.updated_at))

const handleCopy = async () => {
  const ok = await copyToClipboard(props.note.title)
  if (ok) {
    toast.success('已复制标题')
  } else {
    toast.error('复制失败')
  }
  emit('copied')
}
</script>

<style scoped>
.note-card {
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.note-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.note-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  flex: 1;
  transition: color 0.2s ease;
}

.note-title:hover {
  color: var(--primary);
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.note-card:hover .copy-btn {
  opacity: 1;
}

.note-summary {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.note-meta {
  display: flex;
  gap: 14px;
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
