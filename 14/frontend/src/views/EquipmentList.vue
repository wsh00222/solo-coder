<template>
  <div class="equipment-list-page">
    <StatsBoard :stats="statistics" />

    <el-card class="toolbar-card" :body-style="{ padding: '16px' }">
      <el-row :gutter="12" align="middle">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="keyword"
            placeholder="搜索设备名称或编号"
            clearable
            :prefix-icon="Search"
            @input="debouncedLoad"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="5">
          <el-select v-model="statusFilter" placeholder="按状态筛选" clearable style="width: 100%" @change="loadList">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="13" class="action-col">
          <div class="action-buttons">
            <el-switch
              v-model="groupByLocation"
              active-text="按位置分组"
              inactive-text="列表模式"
              style="margin-right: 12px"
            />
            <el-button :icon="Refresh" @click="handleRefresh">刷新状态</el-button>
            <el-button :icon="Download" @click="handleExport">导出全部设备</el-button>
            <el-button type="primary" :icon="Plus" @click="openAddModal">添加设备</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="list-card" :body-style="{ padding: 0 }" v-if="!groupByLocation">
      <el-table
        v-if="equipmentList.length > 0"
        :data="equipmentList"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="code" label="设备编号" width="140">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click.stop="goDetail(row)">
              <strong>{{ row.code }}</strong>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="140">
          <template #default="{ row }">
            <div class="name-cell">
              <el-link type="primary" :underline="false" @click.stop="goDetail(row)">
                {{ row.name }}
              </el-link>
              <el-tag v-if="row.is_overdue" type="danger" effect="dark" size="small" class="overdue-tag">
                逾期
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="规格型号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="location" label="所在位置" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" effect="light">
              {{ statusMap[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click.stop="goDetail(row)">详情</el-button>
            <el-button size="small" link @click.stop="openEditModal(row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              link
              :disabled="row.status !== 'available'"
              @click.stop="openBorrowModal(row)"
            >快速借用</el-button>
            <el-button
              size="small"
              type="warning"
              link
              :disabled="row.status !== 'borrowed'"
              @click.stop="openReturnModal(row)"
            >归还</el-button>
            <el-button
              size="small"
              type="danger"
              link
              :disabled="row.status !== 'available'"
              @click.stop="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">
        <el-empty :image-size="120" description="暂无设备数据">
          <el-button type="primary" @click="openAddModal">立即添加</el-button>
        </el-empty>
      </div>
      <div v-if="equipmentList.length > 0" class="list-footer">
        共 {{ equipmentList.length }} 台设备
      </div>
    </el-card>

    <el-card class="list-card" :body-style="{ padding: '16px' }" v-else>
      <template v-if="locationGroups.length > 0">
        <el-collapse v-model="activeLocations">
          <el-collapse-item
            v-for="group in locationGroups"
            :key="group.location"
            :name="group.location"
          >
            <template #title>
              <div class="group-title">
                <el-icon><Location /></el-icon>
                <span>{{ group.location }}</span>
                <el-tag size="small" type="info" effect="plain">{{ group.count }}台</el-tag>
              </div>
            </template>
            <el-table :data="group.items" size="small" @row-click="handleRowClick">
              <el-table-column prop="code" label="设备编号" width="120">
                <template #default="{ row }">
                  <el-link type="primary" :underline="false" @click.stop="goDetail(row)">
                    {{ row.code }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="设备名称" min-width="130">
                <template #default="{ row }">
                  <div class="name-cell">
                    <el-link type="primary" :underline="false" @click.stop="goDetail(row)">
                      {{ row.name }}
                    </el-link>
                    <el-tag v-if="row.is_overdue" type="danger" effect="dark" size="small" class="overdue-tag">
                      逾期
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="model" label="规格型号" min-width="140" show-overflow-tooltip />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="statusMap[row.status]?.type" effect="light" size="small">
                    {{ statusMap[row.status]?.label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click.stop="goDetail(row)">详情</el-button>
                  <el-button
                    size="small"
                    type="success"
                    link
                    :disabled="row.status !== 'available'"
                    @click.stop="openBorrowModal(row)"
                  >快速借用</el-button>
                  <el-button
                    size="small"
                    type="warning"
                    link
                    :disabled="row.status !== 'borrowed'"
                    @click.stop="openReturnModal(row)"
                  >归还</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    link
                    :disabled="row.status !== 'available'"
                    @click.stop="handleDelete(row)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
        <div class="list-footer">
          共 {{ equipmentList.length }} 台设备，{{ locationGroups.length }} 个位置分组
        </div>
      </template>
      <div v-else class="empty-state">
        <el-empty :image-size="120" description="暂无设备数据">
          <el-button type="primary" @click="openAddModal">立即添加</el-button>
        </el-empty>
      </div>
    </el-card>

    <EquipmentFormModal
      v-model:visible="formModalVisible"
      :equipment="currentEquipment"
      @success="onFormSuccess"
    />
    <QuickBorrowModal
      v-model:visible="borrowModalVisible"
      :equipment="currentEquipment"
      @success="onBorrowSuccess"
    />
    <ReturnModal
      v-model:visible="returnModalVisible"
      :equipment="currentEquipment"
      @success="onReturnSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  Plus,
  Location
} from '@element-plus/icons-vue'
import StatsBoard from '@/components/StatsBoard.vue'
import EquipmentFormModal from '@/components/EquipmentFormModal.vue'
import QuickBorrowModal from '@/components/QuickBorrowModal.vue'
import ReturnModal from '@/components/ReturnModal.vue'
import {
  getEquipmentList,
  getStatistics,
  refreshOverdue,
  deleteEquipment,
  exportCSV
} from '@/services/equipmentApi'
import {
  STATUS_OPTIONS,
  statusMap,
  groupByLocation as groupEquipmentsByLocation,
  downloadFileFromBlob,
  getToday
} from '@/utils'

const router = useRouter()
const equipmentList = ref([])
const statistics = reactive({
  total: 0,
  available: 0,
  borrowed: 0,
  maintenance: 0,
  overdue: 0
})
const keyword = ref('')
const statusFilter = ref('')
const groupByLocation = ref(false)
const activeLocations = ref([])
const statusOptions = STATUS_OPTIONS

const formModalVisible = ref(false)
const borrowModalVisible = ref(false)
const returnModalVisible = ref(false)
const currentEquipment = ref(null)

let searchTimer = null

const locationGroups = computed(() => {
  const groups = groupEquipmentsByLocation(equipmentList.value)
  return groups.sort((a, b) => a.location.localeCompare(b.location))
})

function debouncedLoad() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadList, 300)
}

async function loadList() {
  const params = {}
  if (statusFilter.value) params.status = statusFilter.value
  if (keyword.value) params.keyword = keyword.value
  const res = await getEquipmentList(params)
  if (res.success) {
    equipmentList.value = res.data || []
  }
}

async function loadStatistics() {
  const res = await getStatistics()
  if (res.success) {
    Object.assign(statistics, res.data || {})
  }
}

async function loadAll() {
  await Promise.all([loadList(), loadStatistics()])
}

async function handleRefresh() {
  const res = await refreshOverdue()
  if (res.success) {
    equipmentList.value = res.data.equipments || []
    Object.assign(statistics, res.data.stats || {})
    ElMessage.success(res.message || '状态已刷新')
  }
}

async function handleExport() {
  const params = {}
  if (statusFilter.value) params.status = statusFilter.value
  if (keyword.value) params.keyword = keyword.value
  try {
    const response = await exportCSV(params)
    const blob = response.data
    const filename = `设备列表_${getToday()}.csv`
    downloadFileFromBlob(blob, filename)
    ElMessage.success('导出成功')
  } catch (e) {}
}

function openAddModal() {
  currentEquipment.value = null
  formModalVisible.value = true
}

function openEditModal(row) {
  currentEquipment.value = { ...row }
  formModalVisible.value = true
}

function openBorrowModal(row) {
  currentEquipment.value = { ...row }
  borrowModalVisible.value = true
}

function openReturnModal(row) {
  currentEquipment.value = { ...row }
  returnModalVisible.value = true
}

function goDetail(row) {
  router.push(`/equipment/${row.id}`)
}

function handleRowClick(row) {
  goDetail(row)
}

async function handleDelete(row) {
  if (row.status !== 'available') {
    ElMessage.warning('设备当前无法删除，仅可用状态可删除')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除设备「${row.name}（${row.code}）」吗？\n设备的所有借用记录将一并移除，此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
  } catch {
    return
  }
  const res = await deleteEquipment(row.id)
  if (res.success) {
    ElMessage.success(res.message || '删除成功')
    await loadAll()
  }
}

function onFormSuccess() {
  loadAll()
}

function onBorrowSuccess() {
  loadAll()
}

function onReturnSuccess() {
  loadAll()
}

onMounted(() => {
  loadAll()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.equipment-list-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.action-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .action-col {
    margin-top: 12px;
    justify-content: flex-start;
  }
  .action-buttons {
    justify-content: flex-start;
  }
}

.list-card {
  border-radius: 8px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.overdue-tag {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.list-footer {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  font-size: 13px;
  color: #606266;
  text-align: right;
}

.empty-state {
  padding: 60px 20px;
}
</style>
