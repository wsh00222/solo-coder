<template>
  <form class="record-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="type-toggle">
        <button type="button" :class="{ active: isIncome }" @click="setType(true)" class="btn-income">收入</button>
        <button type="button" :class="{ active: !isIncome }" @click="setType(false)" class="btn-expense">支出</button>
      </div>
      <input
        type="number"
        step="0.01"
        v-model="form.amount"
        placeholder="金额"
        class="input-amount"
        @input="onAmountInput"
      />
      <select v-model="form.category">
        <option value="" disabled>选择类别</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input type="date" v-model="form.date" />
      <input type="text" v-model="form.note" placeholder="备注（可选）" class="input-note" />
      <button type="submit" class="btn-submit">{{ isEditing ? '保存修改' : '添加记录' }}</button>
      <button v-if="isEditing" type="button" class="btn-cancel" @click="cancelEdit">取消</button>
    </div>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { today } from '../utils/format'

const CATEGORIES = ['餐饮', '交通', '购物', '工资', '娱乐', '住房', '医疗', '教育', '其他']

const props = defineProps({
  editRecord: { type: Object, default: null }
})

const emit = defineEmits(['submit', 'cancel'])

const categories = CATEGORIES
const isIncome = ref(true)
const errorMsg = ref('')

const form = reactive({
  amount: '',
  category: '其他',
  date: today(),
  note: ''
})

const isEditing = ref(false)

watch(() => props.editRecord, (rec) => {
  if (rec) {
    isEditing.value = true
    form.amount = Math.abs(rec.amount)
    form.category = rec.category
    form.date = rec.date
    form.note = rec.note || ''
    isIncome.value = rec.amount >= 0
  }
}, { immediate: true })

function setType(income) {
  isIncome.value = income
}

function onAmountInput() {
  if (Number(form.amount) < 0) {
    isIncome.value = false
  }
}

function handleSubmit() {
  errorMsg.value = ''
  const amountRaw = Number(form.amount)
  if (!form.amount || amountRaw === 0) {
    errorMsg.value = '金额不能为空或为0'
    return
  }
  const finalAmount = isIncome.value ? Math.abs(amountRaw) : -Math.abs(amountRaw)
  const data = {
    amount: finalAmount,
    category: form.category || '其他',
    date: form.date || today(),
    note: form.note
  }
  emit('submit', data)
  resetForm()
}

function resetForm() {
  form.amount = ''
  form.category = '其他'
  form.date = today()
  form.note = ''
  isIncome.value = true
  isEditing.value = false
  errorMsg.value = ''
}

function cancelEdit() {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.record-form {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.type-toggle {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}
.type-toggle button {
  padding: 8px 16px;
  border: none;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.type-toggle .btn-income.active {
  background: #2e9e5a;
  color: #fff;
}
.type-toggle .btn-expense.active {
  background: #e04040;
  color: #fff;
}
.input-amount {
  width: 120px;
}
.input-note {
  flex: 1;
  min-width: 120px;
}
input, select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
input:focus, select:focus {
  border-color: #4a90d9;
}
.btn-submit {
  padding: 8px 20px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-submit:hover { background: #3a7bc8; }
.btn-cancel {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}
.btn-cancel:hover { background: #eee; }
.error-msg {
  color: #e04040;
  font-size: 13px;
  margin-top: 8px;
}
</style>
