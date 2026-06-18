<template>
  <div class="note-editor-page">
    <header class="page-header">
      <div class="container header-inner">
        <router-link to=":back" class="back-link" @click.prevent="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          取消
        </router-link>

        <h2 class="editor-title">{{ isEdit ? '编辑笔记' : '新建笔记' }}</h2>

        <button
          class="btn btn-primary btn-sm"
          :disabled="saving || !canSave"
          @click="handleSave"
        >
          <span v-if="saving" class="btn-loading"></span>
          {{ isEdit ? '保存修改' : '保存' }}
        </button>
      </div>
    </header>

    <main class="container main-content">
      <div v-if="loading && isEdit" class="editor-loading">
        <div class="card">
          <div class="skeleton input-skeleton"></div>
          <div class="skeleton tag-skeleton"></div>
          <div class="skeleton content-skeleton"></div>
        </div>
      </div>

      <form v-else class="editor-form card" @submit.prevent="handleSave">
        <div class="form-group">
          <label class="label" for="title">标题</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="input title-input"
            placeholder="输入笔记标题..."
            :disabled="saving"
            maxlength="200"
          />
          <div class="input-hint">{{ form.title.length }} / 200</div>
        </div>

        <div class="form-group">
          <label class="label">标签</label>
          <div class="tags-input-wrap">
            <div class="selected-tags">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="tag"
              >
                {{ tag }}
                <button
                  type="button"
                  class="tag-remove"
                  :disabled="saving"
                  @click="removeTag(index)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </span>
              <input
                v-model="newTag"
                type="text"
                class="tag-input"
                placeholder="输入标签后按回车添加..."
                :disabled="saving"
                @keydown.enter.prevent="addTag"
                @keydown.backspace="onTagBackspace"
              />
            </div>
            <div v-if="allTags.length > 0" class="suggested-tags">
              <span class="suggested-label">常用标签:</span>
              <span
                v-for="tag in availableSuggestedTags"
                :key="tag.id"
                class="tag tag-sm suggested-tag"
                @click="addExistingTag(tag.name)"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div class="input-hint">按回车添加标签，支持多个标签</div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label class="label" for="content">正文内容</label>
            <div class="preview-toggle">
              <button
                type="button"
                :class="['toggle-btn', { active: !showPreview }]"
                :disabled="saving"
                @click="showPreview = false"
              >
                编辑
              </button>
              <button
                type="button"
                :class="['toggle-btn', { active: showPreview }]"
                :disabled="saving"
                @click="showPreview = true"
              >
                预览
              </button>
            </div>
          </div>
          <textarea
            v-if="!showPreview"
            id="content"
            v-model="form.content"
            class="textarea content-textarea"
            placeholder="支持 Markdown 格式..."
            :disabled="saving"
            rows="18"
          ></textarea>
          <div
            v-else
            class="content-preview prose-content"
            v-html="renderedPreview"
          ></div>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { notesApi, tagsApi } from '../services/api'
import { renderMarkdown } from '../utils'

const route = useRoute()
const router = useRouter()
const toast = inject('toast')

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  content: '',
  tags: []
})

const newTag = ref('')
const allTags = ref([])
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)

const canSave = computed(() => form.title.trim().length > 0)

const availableSuggestedTags = computed(() => {
  const current = new Set(form.tags.map(t => t.toLowerCase()))
  return allTags.value
    .filter(t => !current.has(t.name.toLowerCase()))
    .slice(0, 8)
})

const renderedPreview = computed(() => renderMarkdown(form.content))

async function fetchNote() {
  loading.value = true
  try {
    const res = await notesApi.getById(route.params.id)
    const note = res.data.data
    form.title = note.title
    form.content = note.content
    form.tags = (note.tags || []).map(t => t.name)
  } catch (err) {
    toast.error(err.message || '加载笔记失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function fetchAllTags() {
  try {
    const res = await tagsApi.getAll()
    allTags.value = res.data.data || []
  } catch (_) {
    allTags.value = []
  }
}

function addTag() {
  const value = newTag.value.trim()
  if (!value) return

  if (form.tags.some(t => t === value)) {
    toast.warning('标签已存在')
    return
  }

  form.tags.push(value)
  newTag.value = ''
}

function addExistingTag(name) {
  if (form.tags.some(t => t === name)) return
  form.tags.push(name)
}

function removeTag(index) {
  form.tags.splice(index, 1)
}

function onTagBackspace(e) {
  if (newTag.value === '' && form.tags.length > 0) {
    e.preventDefault()
    form.tags.pop()
  }
}

async function handleSave() {
  if (!canSave.value) {
    toast.warning('请输入标题')
    return
  }

  if (newTag.value.trim()) {
    addTag()
  }

  saving.value = true
  try {
    const data = {
      title: form.title.trim(),
      content: form.content,
      tags: form.tags
    }

    let noteId
    if (isEdit.value) {
      const res = await notesApi.update(route.params.id, data)
      noteId = route.params.id
      toast.success(res.data.message || '笔记更新成功')
    } else {
      const res = await notesApi.create(data)
      noteId = res.data.data.id
      toast.success(res.data.message || '笔记创建成功')
    }

    if (isEdit.value) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => router.push(`/notes/${noteId}`), 300)
    } else {
      router.push(`/notes/${noteId}`)
    }
  } catch (err) {
    toast.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  if (hasChanges() && !confirm('你有未保存的修改，确定要离开吗？')) {
    return
  }
  if (isEdit.value) {
    router.push(`/notes/${route.params.id}`)
  } else {
    router.push('/')
  }
}

function hasChanges() {
  return form.title.trim() !== '' || form.content !== '' || form.tags.length > 0
}

onMounted(() => {
  fetchAllTags()
  if (isEdit.value) {
    fetchNote()
  }
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

.editor-title {
  font-size: 17px;
  font-weight: 600;
}

.main-content {
  padding: 24px;
  max-width: 820px;
}

.editor-loading .card {
  padding: 24px;
  min-height: 500px;
}

.input-skeleton {
  height: 44px;
  margin-bottom: 20px;
}

.tag-skeleton {
  height: 80px;
  margin-bottom: 24px;
}

.content-skeleton {
  height: 400px;
}

.editor-form {
  padding: 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.input-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.title-input {
  font-size: 16px;
  padding: 12px 16px;
}

.tags-input-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.tags-input-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 34px;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  color: currentColor;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tag-remove:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}

.tag-input {
  flex: 1;
  min-width: 160px;
  border: none;
  outline: none;
  padding: 4px 0;
  font-size: 14px;
  background: transparent;
}

.suggested-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.suggested-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-right: 2px;
}

.suggested-tag {
  background-color: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggested-tag:hover {
  background-color: var(--primary-light);
  color: var(--primary);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.preview-toggle {
  display: flex;
  background-color: var(--bg);
  border-radius: var(--radius);
  padding: 2px;
}

.toggle-btn {
  padding: 4px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background-color: #fff;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.toggle-btn:hover:not(.active) {
  color: var(--text);
}

.content-textarea {
  min-height: 360px;
  padding: 16px;
  line-height: 1.7;
}

.content-preview {
  min-height: 360px;
  padding: 16px;
  background-color: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
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

@media (max-width: 640px) {
  .header-inner {
    padding: 12px 16px;
  }

  .main-content {
    padding: 16px;
  }

  .editor-form {
    padding: 20px 16px;
  }
}
</style>
