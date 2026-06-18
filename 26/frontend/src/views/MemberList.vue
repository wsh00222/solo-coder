<template>
  <div class="container">
    <h1 style="margin-bottom: 20px; color: #303133;">团队通讯录</h1>

    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">总人数</div>
      </div>
      <div class="stat-item" v-for="(count, dept) in stats.byDepartment" :key="dept">
        <div class="stat-number" :class="'dept-' + dept">{{ count }}</div>
        <div class="stat-label">{{ dept }}部</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <select v-model="filterDept" @change="loadMembers">
          <option value="all">全部部门</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}部</option>
        </select>
        <input
          type="text"
          v-model="keyword"
          placeholder="搜索姓名或手机号..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <button class="btn btn-primary" @click="openAddModal">+ 添加成员</button>
    </div>

    <div v-if="loading">加载中...</div>

    <div v-else-if="members.length === 0" class="empty-state">
      <div class="icon">📋</div>
      <p>暂无成员，点击上方"添加成员"开始添加吧</p>
      <button class="btn btn-primary" @click="openAddModal">立即添加</button>
    </div>

    <template v-else>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>职位</th>
            <th>手机号</th>
            <th>邮箱</th>
            <th>部门</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>
              <router-link :to="'/member/' + member.id" class="name-link">{{ member.name }}</router-link>
            </td>
            <td>{{ member.position }}</td>
            <td>{{ member.phone }}</td>
            <td>{{ member.email || '-' }}</td>
            <td>
              <span class="department-tag" :class="'dept-' + member.department">{{ member.department }}</span>
            </td>
            <td>
              <button class="btn btn-primary btn-small" style="margin-right: 8px;" @click="openEditModal(member)">编辑</button>
              <button class="btn btn-danger btn-small" @click="handleDelete(member)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer-info">共 {{ members.length }} 人</div>
    </template>

    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal-content">
        <div class="modal-header">{{ isEditing ? '编辑成员' : '添加成员' }}</div>

        <div class="form-item">
          <label>姓名 <span style="color: #f56c6c;">*</span></label>
          <input type="text" v-model="formData.name" placeholder="请输入姓名" />
        </div>

        <div class="form-item">
          <label>职位 <span style="color: #f56c6c;">*</span></label>
          <input type="text" v-model="formData.position" placeholder="请输入职位" />
        </div>

        <div class="form-item">
          <label>手机号 <span style="color: #f56c6c;">*</span></label>
          <input type="text" v-model="formData.phone" placeholder="请输入 11 位手机号" maxlength="11" />
          <div v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</div>
        </div>

        <div class="form-item">
          <label>邮箱</label>
          <input type="text" v-model="formData.email" placeholder="请输入邮箱" />
          <div v-if="formErrors.email" class="error-text">{{ formErrors.email }}</div>
        </div>

        <div class="form-item">
          <label>部门 <span style="color: #f56c6c;">*</span></label>
          <select v-model="formData.department">
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="closeFormModal">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '提交中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content">
        <div class="modal-header">确认删除</div>
        <p style="margin-bottom: 12px;">确定要删除成员 <strong>{{ memberToDelete?.name }}</strong> 吗？</p>
        <p v-if="willBeEmpty" style="color: #e6a23c; margin-bottom: 12px;">
          ⚠️ 删除后该部门（{{ memberToDelete?.department }}）将为空
        </p>
        <p style="color: #909399; font-size: 13px; margin-bottom: 16px;">此操作不可撤销</p>
        <div class="modal-footer">
          <button class="btn btn-default" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMembers, getStats, createMember, updateMember, deleteMember } from '../api'

const router = useRouter()

const departments = ['研发', '市场', '运营', '其他']
const members = ref([])
const stats = ref({ total: 0, byDepartment: {} })
const loading = ref(false)
const filterDept = ref('all')
const keyword = ref('')
let searchTimer = null

const showFormModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formData = reactive({
  name: '',
  position: '',
  phone: '',
  email: '',
  department: '研发'
})
const formErrors = reactive({
  phone: '',
  email: ''
})

const showDeleteModal = ref(false)
const memberToDelete = ref(null)
const deleting = ref(false)
const willBeEmpty = ref(false)

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

async function loadMembers() {
  loading.value = true
  try {
    const params = {}
    if (filterDept.value !== 'all') params.department = filterDept.value
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    const data = await getMembers(params)
    members.value = data
  } catch (err) {
    showToast('加载成员列表失败', 'error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const data = await getStats()
    stats.value = data
  } catch (err) {
    console.error(err)
  }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadMembers()
  }, 300)
}

function resetForm() {
  formData.name = ''
  formData.position = ''
  formData.phone = ''
  formData.email = ''
  formData.department = '研发'
  formErrors.phone = ''
  formErrors.email = ''
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showFormModal.value = true
}

function openEditModal(member) {
  isEditing.value = true
  editingId.value = member.id
  formData.name = member.name
  formData.position = member.position
  formData.phone = member.phone
  formData.email = member.email || ''
  formData.department = member.department
  formErrors.phone = ''
  formErrors.email = ''
  showFormModal.value = true
}

function closeFormModal() {
  if (submitting.value) return
  showFormModal.value = false
}

function validateForm() {
  let valid = true
  formErrors.phone = ''
  formErrors.email = ''

  if (!/^\d{11}$/.test(formData.phone)) {
    formErrors.phone = '手机号必须为 11 位数字'
    valid = false
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    formErrors.email = '邮箱格式不正确'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  if (!formData.name || !formData.position || !formData.department) {
    showToast('请填写所有必填项', 'error')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value) {
      await updateMember(editingId.value, { ...formData })
      showToast('修改成功')
    } else {
      await createMember({ ...formData })
      showToast('添加成功')
    }
    closeFormModal()
    loadMembers()
    loadStats()
  } catch (err) {
    const msg = err.response?.data?.error || '操作失败'
    showToast(msg, 'error')
    if (err.response?.data?.field === 'phone') {
      formErrors.phone = msg
    }
    if (err.response?.data?.field === 'email') {
      formErrors.email = msg
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete(member) {
  memberToDelete.value = member
  willBeEmpty.value = stats.value.byDepartment[member.department] === 1
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  memberToDelete.value = null
}

async function confirmDelete() {
  if (!memberToDelete.value) return
  deleting.value = true
  try {
    const result = await deleteMember(memberToDelete.value.id)
    showToast(result.willBeEmpty ? '删除成功，该部门已为空' : '删除成功')
    closeDeleteModal()
    loadMembers()
    loadStats()
  } catch (err) {
    showToast('删除失败', 'error')
    console.error(err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadMembers()
  loadStats()
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>
