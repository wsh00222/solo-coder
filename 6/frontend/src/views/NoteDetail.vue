<template>
  <div class="note-detail-page">
    <header class="page-header">
      <div class="container header-inner">
        <router-link to="/" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          返回列表
        </router-link>

        <div v-if="!loading" class="detail-actions">
          <router-link
            :to="`/notes/${note.id}/edit`"
            class="btn btn-secondary btn-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            编辑
          </router-link>
          <button class="btn btn-danger btn-sm" @click="showDeleteModal = true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path></svg>
            删除
          </button>
        </div>
      </div>
    </header>

    <main class="container main-content">
      <div v-if="loading || showSlowLoading" class="detail-loading">
        <div class="card loading-detail-card">
          <div class="skeleton skeleton-title-lg"></div>
          <div class="skeleton skeleton-meta"></div>
          <div class="skeleton-tags">
            <div class="skeleton skeleton-tag-sm"></div>
            <div class="skeleton skeleton-tag-sm"></div>
          </div>
          <div class="skeleton-divider"></div>
          <div v-for="i in 6" :key="i" :class="['skeleton', 'skeleton-paragraph', `skeleton-paragraph-${i}`]"></div>
        </div>
      </div>

      <div v-else-if="notFound" class="not-found">
        <EmptyState
          type="no-results"
          title="笔记不存在"
          description="该笔记可能已被删除或 ID 无效"
          @clear="$router.push('/')"
        />
      </div>

      <article v-else class="note-detail card">
        <header class="note-header">
          <h1 class="note-title">{{ note.title }}</h1>

          <div v-if="note.tags && note.tags.length" class="note-tags">
            <router-link
              v-for="tag in note.tags"
              :key="tag.id"
              :to="`/?tag=${encodeURIComponent(tag.name)}`"
              class="tag"
            >
              {{ tag.name }}
            </router-link>
          </div>

          <div class="note-meta">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>创建于 {{ formatDate(note.created_at) }}</span>
            </div>
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>更新于 {{ formatDate(note.updated_at) }}</span>
            </div>
          </div>
        </header>

        <div class="note-content">
          <div
            class="prose-content"
            v-html="renderedContent"
          ></div>
        </div>
      </article>
    </main>

    <ConfirmModal
      :show="showDeleteModal"
      title="删除笔记"
      message="确定删除这篇笔记吗？此操作无法撤销。"
      confirm-text="确认删除"
      cancel-text="取消"
      :confirm-danger="true"
      :loading="deleting"
      @cancel="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { notesApi } from '../services/api'
import { formatDate, renderMarkdown } from '../utils'
import EmptyState from '../components/EmptyState.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()

const toast = inject('toast')

const note = ref(null)
const loading = ref(false)
const showSlowLoading = ref(false)
const notFound = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)

let slowTimer = null

const renderedContent = computed(() => {
  if (!note.value) return ''
  return renderMarkdown(note.value.content || '')
})

async function fetchNote() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  notFound.value = false
  slowTimer = setTimeout(() => {
    showSlowLoading.value = true
  }, 1500)

  try {
    const res = await notesApi.getById(id)
    note.value = res.data.data
  } catch (err) {
    if (err.message?.includes('不存在') || err.message?.includes('404')) {
      notFound.value = true
    } else {
      toast.error(err.message || '加载笔记失败')
    }
  } finally {
    loading.value = false
    clearTimeout(slowTimer)
    showSlowLoading.value = false
  }
}

async function handleDelete() {
  if (!note.value) return

  deleting.value = true
  try {
    await notesApi.remove(note.value.id)
    toast.success('笔记删除成功')
    showDeleteModal.value = false
    router.push('/')
  } catch (err) {
    toast.error(err.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

watch(
  () => route.params.id,
  () => fetchNote()
)

onMounted(fetchNote)
</script>

<style scoped>
.page-header {
  background-color: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  gap: 16px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 8px 12px;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.back-link:hover {
  background-color: var(--bg);
  color: var(--text);
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  padding: 24px;
  max-width: 820px;
}

.detail-loading {
  min-height: 400px;
}

.loading-detail-card {
  padding: 32px;
}

.skeleton-title-lg {
  height: 32px;
  width: 80%;
  margin-bottom: 16px;
}

.skeleton-meta {
  height: 14px;
  width: 280px;
  margin-bottom: 20px;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
}

.skeleton-tag-sm {
  width: 72px;
  height: 26px;
  border-radius: 9999px;
}

.skeleton-divider {
  height: 1px;
  background-color: var(--border);
  margin: 24px 0;
}

.skeleton-paragraph {
  height: 14px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-paragraph-1 { width: 100%; }
.skeleton-paragraph-2 { width: 95%; }
.skeleton-paragraph-3 { width: 88%; }
.skeleton-paragraph-4 { width: 92%; }
.skeleton-paragraph-5 { width: 70%; }
.skeleton-paragraph-6 { width: 50%; }

.not-found {
  padding: 40px 0;
}

.note-detail {
  padding: 40px;
}

.note-header {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.note-title {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text);
  margin-bottom: 16px;
  word-break: break-word;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-content {
  font-size: 15px;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .header-inner {
    padding: 12px 16px;
  }

  .main-content {
    padding: 16px;
  }

  .note-detail {
    padding: 24px 20px;
  }

  .note-title {
    font-size: 24px;
  }
}
</style>
