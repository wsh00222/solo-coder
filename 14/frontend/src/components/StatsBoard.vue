<template>
  <div class="stats-board">
    <el-row :gutter="16">
      <el-col :xs="12" :sm="8" :md="4" v-for="item in items" :key="item.key">
        <el-card class="stat-card" :body-style="{ padding: '16px' }">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value" :style="{ color: item.color }">{{ stats[item.key] ?? 0 }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
              <el-icon :size="28" :color="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {
  DataBoard,
  CircleCheck,
  Calendar,
  Tools,
  Warning
} from '@element-plus/icons-vue'

defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      available: 0,
      borrowed: 0,
      maintenance: 0,
      overdue: 0
    })
  }
})

const items = [
  { key: 'total', label: '总设备数', color: '#409EFF', bgColor: '#ECF5FF', icon: DataBoard },
  { key: 'available', label: '可用设备', color: '#67C23A', bgColor: '#F0F9EB', icon: CircleCheck },
  { key: 'borrowed', label: '已借出', color: '#F56C6C', bgColor: '#FEF0F0', icon: Calendar },
  { key: 'maintenance', label: '维修中', color: '#909399', bgColor: '#F4F4F5', icon: Tools },
  { key: 'overdue', label: '逾期设备', color: '#E6A23C', bgColor: '#FDF6EC', icon: Warning }
]
</script>

<style scoped>
.stats-board {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 22px;
  }
  .stat-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
