<template>
  <div class="equipment-detail-page">
    <div class="page-header">
      <el-page-header @back="router.back()" class="back-header">
        <template #content>
          <div class="header-title">
            <el-icon :size="22"><Monitor /></el-icon>
            <span>{{ equipment?.name || '设备详情' }}</span>
            <el-tag v-if="equipment?.is_overdue" type="danger" effect="dark" size="default" class="overdue-tag">
              逾期
            </el-tag>
          </div>
        </template>
      </el-page-header>
      <div class="header-actions" v-if="equipment">
        <el-button :icon="Edit" @click="openEditModal" :disabled="loading">编辑设备</el-button>
        <el-button
          type="success"
          :icon="Briefcase"
          :disabled="equipment.status !== 'available' || loading"
          @click="openBorrowModal"
        >
          发起借用
        </el-button>
        <el-button
          type="warning"
          :icon="RefreshRight"
          :disabled="equipment.status !== 'borrowed' || loading"
          @click="openReturnModal"
        >
          归还设备
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="equipment.status !== 'available' || loading"
          @click="handleDelete"
        >
          删除设备
        </el-button>
        <el-tooltip
          v-if="equipment.status !== 'available'"
          content="设备当前无法删除，仅可用状态可删除"
          placement="top"
          :show-after="300"
        >
          <el-button type="danger" disabled icon="Delete" style="display: none">占位</el-button>
        </el-tooltip>
      </div>
    </div>

    <div v-loading="loading" v-if="equipment" class="detail-content">
      <el-row :gutter="16">
        <el-col :xs="24" :md="8">
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>设备信息</span>
              </div>
            </template>
            <div class="info-item">
              <span class="info-label">设备编号</span>
              <span class="info-value mono">{{ equipment.code }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备名称</span>
              <span class="info-value">{{ equipment.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">规格型号</span>
              <span class="info-value">{{ equipment.model || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所在位置</span>
              <span class="info-value">
                <el-icon><Location /></el-icon>
                {{ equipment.location || '-' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">设备状态</span>
              <span class="info-value">
                <el-tag :type="statusMap[equipment.status]?.type" effect="light" size="default">
                  {{ statusMap[equipment.status]?.label }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value small">{{ formatDateTime(equipment.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间</span>
              <span class="info-value small">{{ formatDateTime(equipment.updated_at) }}</span>
            </div>
          </el-card>

          <el-card class="info-card" shadow="never" style="margin-top: 16px">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>借用统计</span>
              </div>
            </template>
            <div v-if="borrowStats && borrowStats.returnedCount > 0">
              <div class="stat-item">
                <div class="stat-num">{{ borrowStats.totalCount }}</div>
                <div class="stat-name">借用总次数</div>
              </div>
              <div class="stat-grid">
                <div class="stat-item small">
                  <div class="stat-num small">{{ borrowStats.avgDuration }}</div>
                  <div class="stat-name">平均借用天数</div>
                </div>
                <div class="stat-item small">
                  <div class="stat-num small">{{ borrowStats.maxDuration }}</div>
                  <div class="stat-name">最长借用天数</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无统计数据" :image-size="80" />
          </el-card>
        </el-col>

        <el-col :xs="24" :md="16">
          <el-card class="records-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Tickets /></el-icon>
                <span>借用历史记录</span>
                <el-tag size="small" type="info" effect="plain" style="margin-left: 8px">
                  共 {{ borrowRecords.length }} 条记录
                </el-tag>
              </div>
            </template>
            <el-table
              v-if="borrowRecords.length > 0"
              :data="borrowRecords"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="borrower" label="借用人" width="100" />
              <el-table-column prop="reason" label="借用事由" min-width="180" show-overflow-tooltip />
              <el-table-column prop="borrow_date" label="借用日期" width="120">
                <template #default="{ row }">
                  <span>{{ formatDate(row.borrow_date) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="expected_return_date" label="预计归还" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-danger': row.displayStatus === 'overdue' }">
                    {{ formatDate(row.expected_return_date) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="actual_return_date" label="实际归还" width="120">
                <template #default="{ row }">
                  <span>{{ row.actual_return_date ? formatDate(row.actual_return_date) : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="recordStatusMap[row.displayStatus || row.status]?.type"
                    effect="light"
                    size="small"
                  >
                    {{ recordStatusMap[row.displayStatus || row.status]?.label }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无借用记录" :image-size="100" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else-if="!loading && !equipment" description="设备不存在或已被删除" />

    <EquipmentFormModal
      v-model:visible="formModalVisible"
      :equipment="equipment"
      @success="onFormSuccess"
    />
    <QuickBorrowModal
      v-model:visible="borrowModalVisible"
      :equipment="equipment"
      @success="onBorrowSuccess"
    />
    <ReturnModal
      v-model:visible="returnModalVisible"
      :equipment="equipment"
      @success="onReturnSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor,
  Edit,
  Briefcase,
  RefreshRight,
  Delete,
  InfoFilled,
  Location,
  DataAnalysis,
  Tickets
} from '@element-plus/icons-vue'
import EquipmentFormModal from '@/components/EquipmentFormModal.vue'
import QuickBorrowModal from '@/components/QuickBorrowModal.vue'
import ReturnModal from '@/components/ReturnModal.vue'
import { getEquipmentDetail, deleteEquipment } from '@/services/equipmentApi'
import {
  statusMap,
  recordStatusMap,
  formatDate,
  formatDateTime
} from '@/utils'

const route = useRoute()
const router = useRouter()

const equipment = ref(null)
const borrowRecords = ref([])
const borrowStats = ref(null)
const loading = ref(false)

const formModalVisible = ref(false)
const borrowModalVisible = ref(false)
const returnModalVisible = ref(false)

const id = computedId()

function computedId() {
  return () => parseInt(route.params.id, 10)
}

async function loadDetail() {
  const eid = parseInt(route.params.id, 10)
  if (isNaN(eid)) {
    equipment.value = null
    return
  }
  loading.value = true
  try {
    const res = await getEquipmentDetail(eid)
    if (res.success) {
      const data = res.data || {}
      equipment.value = data
      borrowRecords.value = data.borrowRecords || []
      borrowStats.value = data.borrowStats || null
    } else {
      equipment.value = null
    }
  } finally {
    loading.value = false
  }
}

function openEditModal() {
  formModalVisible.value = true
}

function openBorrowModal() {
  borrowModalVisible.value = true
}

function openReturnModal() {
  returnModalVisible.value = true
}

async function handleDelete() {
  if (!equipment.value || equipment.value.status !== 'available') {
    ElMessage.warning('设备当前无法删除，仅可用状态可删除')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除设备「${equipment.value.name}（${equipment.value.code}）」吗？\n设备的所有借用记录将一并移除，此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }
  const res = await deleteEquipment(equipment.value.id)
  if (res.success) {
    ElMessage.success(res.message || '删除成功')
    router.push('/equipment')
  }
}

function onFormSuccess() {
  loadDetail()
}

function onBorrowSuccess() {
  loadDetail()
}

function onReturnSuccess() {
  loadDetail()
}

watch(
  () => route.params.id,
  () => {
    loadDetail()
  }
)

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.equipment-detail-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.back-header {
  flex: 1;
  min-width: 280px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.overdue-tag {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-content {
  min-height: 400px;
}

.info-card,
.records-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
  gap: 12px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-value.small {
  font-size: 13px;
}

.info-value.mono {
  font-family: monospace;
  color: #409EFF;
}

.stat-item {
  text-align: center;
  padding: 16px 0;
}

.stat-item.small {
  padding: 8px 0;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1.2;
}

.stat-num.small {
  font-size: 22px;
  color: #67C23A;
}

.stat-name {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px dashed #ebeef5;
  padding-top: 8px;
}

.text-danger {
  color: #F56C6C;
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-value {
    font-size: 13px;
  }
  .stat-num {
    font-size: 24px;
  }
}
</style>
