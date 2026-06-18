<template>
  <ConfirmModal
    :show="show"
    title="标签管理"
    :show-actions="false"
    @cancel="$emit('close')"
  >
    <div class="tag-manager">
      <div v-if="loading" class="tags-loading">
        <div v-for="i in 3" :key="i" class="tag-skeleton">
          <div class="skeleton tag-skeleton-name"></div>
          <div class="skeleton tag-skeleton-count"></div>
          <div class="skeleton tag-skeleton-btn"></div>
        </div>
      </div>

      <div v-else-if="tags.length === 0" class="tags-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
        <p>暂无标签</p>
      </div>

      <div v-else class="tags-list">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-row"
        >
          <span class="tag-name-row">
            <span class="tag tag-sm">{{ tag.name }}</span>
          </span>
          <span class="tag-count">{{ tag.usage_count }} 篇笔记</span>
          <button
            class="btn-icon btn-ghost delete-tag-btn"
            title="删除标签"
            @click="handleDelete(tag)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
          </button>
        </div>
      </div>

      <div class="tag-manager-tip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        删除标签会移除所有笔记中的该标签，但笔记本身保留
      </div>
    </div>
  </ConfirmModal>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import ConfirmModal from './ConfirmModal.vue'
import { tagsApi } from '../services/api'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'deleted'])

const toast = inject('toast')

const tags = ref([])
const loading = ref(false)

async function fetchTags() {
  loading.value = true
  try {
    const res = await tagsApi.getAll()
    tags.value = res.data.data || []
  } catch (err) {
    toast.error(err.message || '获取标签失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) fetchTags()
  }
)

async function handleDelete(tag) {
  if (!confirm(`确定删除标签「${tag.name}」吗？\n该标签将从所有笔记中移除。`)) return

  try {
    await tagsApi.remove(tag.id)
    toast.success(`标签「${tag.name}」已删除`)
    emit('deleted')
    await fetchTags()
  } catch (err) {
    toast.error(err.message || '删除标签失败')
  }
}
</script>

<style scoped>
.tag-manager {
  min-width: 320px;
}

.tags-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.tag-skeleton-name {
  width: 100px;
  height: 24px;
  border-radius: 9999px;
}

.tag-skeleton-count {
  flex: 1;
  height: 16px;
  max-width: 120px;
}

.tag-skeleton-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.tags-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
}

.tags-empty p {
  margin-top: 8px;
  font-size: 14px;
}

.tags-list {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 0 8px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
}

.tag-row:last-child {
  border-bottom: none;
}

.tag-name-row {
  flex-shrink: 0;
}

.tag-count {
  flex: 1;
  color: var(--text-secondary);
  font-size: 13px;
}

.delete-tag-btn {
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.2s ease;
}

.tag-row:hover .delete-tag-btn {
  opacity: 1;
}

.delete-tag-btn:hover {
  color: var(--danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.tag-manager-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 10px 12px;
  background-color: var(--bg);
  border-radius: var(--radius);
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
