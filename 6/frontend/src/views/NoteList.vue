<template>
  <div class="note-list-page">
    <header class="page-header">
      <div class="container header-inner">
        <div class="header-left">
          <h1 class="page-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            知识笔记
          </h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" @click="showTagManager = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            标签管理
          </button>
          <router-link to="/new" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            新建笔记
          </router-link>
        </div>
      </div>
    </header>

    <main class="container main-content">
      <StatsPanel :stats="stats" :loading="statsLoading" />

      <div class="search-bar card">
        <div class="search-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索笔记标题..."
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            class="btn-icon btn-ghost clear-btn"
            @click="clearSearch"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div v-if="allTags.length > 0" class="tag-filter card">
        <div class="tag-filter-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
          标签筛选:
        </div>
        <div class="tag-filter-list">
          <span
            class="tag tag-sm"
            :class="{ active: !selectedTag }"
            @click="selectTag('')"
          >
            全部
          </span>
          <span
            v-for="tag in allTags"
            :key="tag.id"
            class="tag tag-sm"
            :class="{ active: selectedTag === tag.name }"
            @click="selectTag(tag.name)"
          >
            {{ tag.name }}
            <span class="tag-count">({{ tag.usage_count }})</span>
          </span>
        </div>
      </div>

      <div class="notes-section">
        <template v-if="showLoading">
          <LoadingSkeleton :count="5" />
        </template>

        <template v-else-if="notes.length === 0 && !hasFilter">
          <EmptyState
            type="no-notes"
            title="还没有任何笔记"
            description="开始创建你的第一篇笔记吧！"
          />
        </template>

        <template v-else-if="notes.length === 0 && hasFilter">
          <EmptyState
            type="no-results"
            title="未找到匹配笔记"
            description="尝试调整搜索关键词或清除标签筛选"
            @clear="clearAllFilters"
          />
        </template>

        <template v-else>
          <NoteCard
            v-for="note in notes"
            :key="note.id"
            :note="note"
            :selected-tag="selectedTag"
            @tag-click="selectTag"
          />

          <Pagination
            v-if="pagination.totalPages > 1"
            :page="pagination.page"
            :total-pages="pagination.totalPages"
            @change="changePage"
          />
        </template>

        <div v-if="pagination.total > 0" class="total-count">
          共 {{ pagination.total }} 篇笔记
          <span v-if="hasFilter" class="filtered-hint">
            (筛选后 {{ pagination.total }} 条)
          </span>
        </div>
      </div>
    </main>

    <TagManager
      :show="showTagManager"
      @close="showTagManager = false"
      @deleted="onTagDeleted"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { notesApi, tagsApi } from '../services/api'
import { debounce } from '../utils'
import NoteCard from '../components/NoteCard.vue'
import Pagination from '../components/Pagination.vue'
import StatsPanel from '../components/StatsPanel.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import TagManager from '../components/TagManager.vue'

const router = useRouter()
const route = useRoute()
const toast = inject('toast')

const notes = ref([])
const allTags = ref([])
const loading = ref(false)
const statsLoading = ref(false)
const showLoading = ref(false)
const showTagManager = ref(false)

const pagination = reactive({
  page: 1,
  total: 0,
  totalPages: 0,
  pageSize: 5
})

const stats = reactive({
  totalNotes: 0,
  totalTags: 0,
  recentLast7Days: 0
})

const searchQuery = ref(route.query.search || '')
const selectedTag = ref(route.query.tag || '')

let slowRequestTimer = null

const hasFilter = computed(() => {
  return searchQuery.value.trim() !== '' || selectedTag.value !== ''
})

function startSlowRequestTimer() {
  clearTimeout(slowRequestTimer)
  slowRequestTimer = setTimeout(() => {
    showLoading.value = true
  }, 1500)
}

function stopSlowRequestTimer() {
  clearTimeout(slowRequestTimer)
  showLoading.value = false
}

async function fetchNotes(resetPage = false) {
  if (resetPage) pagination.page = 1

  const params = {
    page: pagination.page
  }
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (selectedTag.value) params.tag = selectedTag.value

  loading.value = true
  startSlowRequestTimer()

  try {
    const res = await notesApi.getList(params)
    notes.value = res.data.data || []
    pagination.total = res.data.pagination?.total || 0
    pagination.totalPages = res.data.pagination?.totalPages || 0
    pagination.pageSize = res.data.pagination?.pageSize || 5
    pagination.page = res.data.pagination?.page || 1

    if (res.data.stats) {
      stats.totalNotes = res.data.stats.filteredTotal || 0
      stats.recentLast7Days = res.data.stats.recentLast7Days || 0
    }
  } catch (err) {
    toast.error(err.message || '加载笔记失败')
  } finally {
    loading.value = false
    stopSlowRequestTimer()
  }
}

async function fetchAllTags() {
  try {
    const res = await tagsApi.getAll()
    allTags.value = res.data.data || []
    stats.totalTags = allTags.value.length
  } catch (err) {
    console.warn('获取标签失败:', err.message)
  }
}

async function fetchStats() {
  statsLoading.value = true
  try {
    const params = {}
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
    if (selectedTag.value) params.tag = selectedTag.value

    const res = await notesApi.getStats(params)
    stats.totalNotes = res.data.totalNotes || 0
    stats.totalTags = res.data.totalTags || 0
    stats.recentLast7Days = res.data.recentLast7Days || 0
  } catch (err) {
    console.warn('获取统计失败:', err.message)
  } finally {
    statsLoading.value = false
  }
}

function updateQueryParams() {
  const query = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedTag.value) query.tag = selectedTag.value
  router.replace({ query })
}

const onSearchInput = debounce(() => {
  pagination.page = 1
  updateQueryParams()
  fetchNotes()
  fetchStats()
}, 300)

function clearSearch() {
  searchQuery.value = ''
  pagination.page = 1
  updateQueryParams()
  fetchNotes()
  fetchStats()
}

function selectTag(tagName) {
  selectedTag.value = tagName
  pagination.page = 1
  updateQueryParams()
  fetchNotes()
  fetchStats()
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedTag.value = ''
  pagination.page = 1
  updateQueryParams()
  fetchNotes()
  fetchStats()
}

function changePage(page) {
  pagination.page = page
  fetchNotes()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onTagDeleted() {
  fetchAllTags()
  fetchNotes()
  fetchStats()
}

watch(
  () => route.query,
  (q) => {
    if (q.search !== undefined && q.search !== searchQuery.value) {
      searchQuery.value = q.search
    }
    if (q.tag !== undefined && q.tag !== selectedTag.value) {
      selectedTag.value = q.tag
    }
  },
  { deep: true }
)

onMounted(() => {
  fetchAllTags()
  fetchNotes()
  fetchStats()
})
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
  padding: 16px 24px;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  padding: 24px;
  max-width: 960px;
}

.search-bar {
  padding: 12px 16px;
  margin-bottom: 16px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 6px 0;
  font-size: 15px;
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  padding: 4px;
}

.tag-filter {
  padding: 14px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 4px 0;
  flex-shrink: 0;
}

.tag-filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.tag-count {
  opacity: 0.7;
  margin-left: 2px;
}

.notes-section {
  min-height: 300px;
}

.total-count {
  text-align: center;
  margin-top: 24px;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  border-top: 1px solid var(--border);
}

.filtered-hint {
  color: var(--primary);
  font-weight: 500;
}

@media (max-width: 640px) {
  .header-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
