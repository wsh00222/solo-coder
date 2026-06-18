<template>
  <div
    class="record-item"
    :class="{ 'deleting': deleting }"
  >
    <div class="item-left">
      <span class="item-icon">{{ categoryIcon(record.category) }}</span>
      <div class="item-info">
        <div class="item-top">
          <span class="item-category">{{ record.category }}</span>
          <span class="item-date">{{ record.date }}</span>
        </div>
        <span v-if="record.note" class="item-note">{{ record.note }}</span>
      </div>
    </div>
    <div class="item-right">
      <span class="item-amount" :class="record.amount >= 0 ? 'income' : 'expense'">
        {{ record.amount >= 0 ? '+' : '' }}{{ formatAmount(record.amount) }}
      </span>
      <div class="item-actions">
        <button class="btn-edit" @click="$emit('edit', record)">编辑</button>
        <button class="btn-delete" @click="handleDelete">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatAmount, categoryIcon } from '../utils/format'

const props = defineProps({
  record: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const deleting = ref(false)

function handleDelete() {
  if (!confirm('确定要删除这条记录吗？')) return
  deleting.value = true
  setTimeout(() => {
    emit('delete', props.record.id)
  }, 300)
}
</script>

<style scoped>
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: opacity 0.3s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease;
  max-height: 120px;
  overflow: hidden;
}
.record-item.deleting {
  opacity: 0;
  max-height: 0;
  margin: 0;
  padding: 0 18px;
}
.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.item-icon {
  font-size: 24px;
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-category {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}
.item-date {
  font-size: 12px;
  color: #999;
}
.item-note {
  font-size: 13px;
  color: #777;
}
.item-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.item-amount {
  font-size: 17px;
  font-weight: 700;
  min-width: 90px;
  text-align: right;
}
.item-amount.income { color: #2e9e5a; }
.item-amount.expense { color: #e04040; }
.item-actions {
  display: flex;
  gap: 6px;
}
.btn-edit, .btn-delete {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}
.btn-edit:hover { background: #f0f7ff; border-color: #4a90d9; color: #4a90d9; }
.btn-delete:hover { background: #fff5f5; border-color: #e04040; color: #e04040; }
</style>
