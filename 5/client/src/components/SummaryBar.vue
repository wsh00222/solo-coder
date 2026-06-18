<template>
  <div class="summary-bar">
    <div class="summary-card income">
      <span class="label">总收入</span>
      <span class="value">+{{ formatAmount(summary.totalIncome) }}</span>
    </div>
    <div class="summary-card expense">
      <span class="label">总支出</span>
      <span class="value">-{{ formatAmount(summary.totalExpense) }}</span>
    </div>
    <div class="summary-card balance">
      <span class="label">结余</span>
      <span class="value">{{ formatAmount(summary.balance) }}</span>
      <span v-if="trend" class="trend" :class="trend.direction">
        {{ trend.arrow }} {{ trend.percent }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatAmount } from '../utils/format'

const props = defineProps({
  summary: { type: Object, required: true },
  lastMonthBalance: { type: Number, default: 0 }
})

const trend = computed(() => {
  const current = props.summary.balance
  const last = props.lastMonthBalance
  if (last === 0 && current === 0) return null
  if (last === 0) return current > 0
    ? { arrow: '↑', percent: '100.00%', direction: 'up' }
    : current < 0
      ? { arrow: '↓', percent: '100.00%', direction: 'down' }
      : null
  const diff = current - last
  const pct = Math.abs(diff / Math.abs(last) * 100).toFixed(2)
  if (diff > 0) return { arrow: '↑', percent: `${pct}%`, direction: 'up' }
  if (diff < 0) return { arrow: '↓', percent: `${pct}%`, direction: 'down' }
  return null
})
</script>

<style scoped>
.summary-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.summary-card .label {
  font-size: 13px;
  color: #888;
}
.summary-card .value {
  font-size: 22px;
  font-weight: 700;
}
.summary-card.income .value { color: #2e9e5a; }
.summary-card.expense .value { color: #e04040; }
.summary-card.balance .value { color: #333; }
.trend {
  font-size: 12px;
  margin-left: 6px;
  font-weight: 600;
}
.trend.up { color: #2e9e5a; }
.trend.down { color: #e04040; }

@media (max-width: 600px) {
  .summary-bar { flex-direction: column; gap: 10px; }
  .summary-card .value { font-size: 18px; }
}
</style>
