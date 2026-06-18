<template>
  <div class="ledger-app">
    <header class="app-header">
      <h1>💰 个人日常记账本</h1>
      <button class="btn-export" @click="handleExport">📥 导出当前筛选数据</button>
    </header>

    <SummaryBar :summary="summary" :lastMonthBalance="lastMonthBalance" />

    <RecordForm
      :editRecord="editingRecord"
      @submit="handleSubmit"
      @cancel="cancelEdit"
    />

    <FilterBar @change="handleFilterChange" />

    <RecordList
      :records="records"
      @edit="startEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SummaryBar from '../components/SummaryBar.vue'
import RecordForm from '../components/RecordForm.vue'
import FilterBar from '../components/FilterBar.vue'
import RecordList from '../components/RecordList.vue'
import {
  fetchRecords,
  fetchSummary,
  createRecord,
  updateRecord,
  deleteRecord
} from '../api/records'
import { exportCSV } from '../utils/format'

const records = ref([])
const summary = ref({ totalIncome: 0, totalExpense: 0, balance: 0, count: 0 })
const lastMonthBalance = ref(0)
const editingRecord = ref(null)
const currentFilter = ref({ category: '全部', startDate: '', endDate: '' })
const deleteQueue = ref([])
let isDeleting = false

async function loadData() {
  const [recordList, summaryData] = await Promise.all([
    fetchRecords(currentFilter.value),
    fetchSummary(currentFilter.value)
  ])
  records.value = recordList
  summary.value = summaryData
  lastMonthBalance.value = summaryData.lastMonthBalance || 0
}

function handleFilterChange(filter) {
  currentFilter.value = filter
  loadData()
}

async function handleSubmit(data) {
  if (editingRecord.value) {
    await updateRecord(editingRecord.value.id, data)
    editingRecord.value = null
  } else {
    await createRecord(data)
  }
  await loadData()
}

function startEdit(record) {
  editingRecord.value = { ...record }
}

function cancelEdit() {
  editingRecord.value = null
}

function handleDelete(id) {
  deleteQueue.value.push(id)
  processDeleteQueue()
}

async function processDeleteQueue() {
  if (isDeleting || deleteQueue.value.length === 0) return
  isDeleting = true
  const id = deleteQueue.value.shift()
  await deleteRecord(id)
  await loadData()
  await new Promise(r => setTimeout(r, 50))
  isDeleting = false
  processDeleteQueue()
}

function handleExport() {
  exportCSV(records.value)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.app-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}
.btn-export {
  padding: 8px 16px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-export:hover {
  background: #3a7bc8;
}
</style>
