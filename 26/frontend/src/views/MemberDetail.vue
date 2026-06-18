<template>
  <div class="container detail-page">
    <router-link to="/" class="back-link">← 返回列表</router-link>

    <div v-if="loading">加载中...</div>

    <div v-else-if="!member" class="empty-state">
      <div class="icon">❓</div>
      <p>成员不存在</p>
      <router-link to="/" class="btn btn-primary">返回列表</router-link>
    </div>

    <div v-else class="detail-card">
      <div class="detail-header">
        <div class="avatar">{{ member.name.charAt(0) }}</div>
        <div class="detail-header-info">
          <h1>{{ member.name }}</h1>
          <span class="department-tag" :class="'dept-' + member.department">{{ member.department }}部</span>
          <span style="margin-left: 12px; color: #909399;">{{ member.position }}</span>
        </div>
      </div>

      <div class="detail-body">
        <div class="detail-item">
          <span class="label">姓名</span>
          <span class="value">{{ member.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">职位</span>
          <span class="value">{{ member.position }}</span>
        </div>
        <div class="detail-item">
          <span class="label">手机号</span>
          <span class="value">{{ member.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱</span>
          <span class="value email-value">
            {{ member.email || '-' }}
            <button v-if="member.email" class="copy-btn" @click="copyEmail">
              {{ copied ? '已复制' : '复制邮箱' }}
            </button>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">部门</span>
          <span class="value">
            <span class="department-tag" :class="'dept-' + member.department">{{ member.department }}</span>
          </span>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMember } from '../api'

const route = useRoute()

const member = ref(null)
const loading = ref(false)
const copied = ref(false)

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2000)
}

async function loadMember() {
  loading.value = true
  try {
    const data = await getMember(route.params.id)
    member.value = data
  } catch (err) {
    if (err.response?.status === 404) {
      member.value = null
    } else {
      showToast('加载成员信息失败', 'error')
    }
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function copyEmail() {
  if (!member.value?.email) return
  try {
    await navigator.clipboard.writeText(member.value.email)
    copied.value = true
    showToast('已复制')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    showToast('复制失败', 'error')
    console.error(err)
  }
}

onMounted(() => {
  loadMember()
})
</script>
