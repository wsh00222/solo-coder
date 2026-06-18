<template>
  <div class="filter-bar">
    <select v-model="localCategory" @change="emitChange">
      <option value="全部">全部类别</option>
      <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
    </select>
    <input type="date" v-model="localStartDate" @change="emitChange" placeholder="起始日期" />
    <span class="sep">~</span>
    <input type="date" v-model="localEndDate" @change="emitChange" placeholder="结束日期" />
    <button class="btn-clear" v-if="hasFilter" @click="clearFilter">清除筛选</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const CATEGORIES = ['餐饮', '交通', '购物', '工资', '娱乐', '住房', '医疗', '教育', '其他']

const props = defineProps({
  category: { type: String, default: '全部' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' }
})

const emit = defineEmits(['change'])

const categories = CATEGORIES

const localCategory = ref(props.category)
const localStartDate = ref(props.startDate)
const localEndDate = ref(props.endDate)

const hasFilter = computed(() =>
  localCategory.value !== '全部' || localStartDate.value || localEndDate.value
)

function emitChange() {
  emit('change', {
    category: localCategory.value,
    startDate: localStartDate.value,
    endDate: localEndDate.value
  })
}

function clearFilter() {
  localCategory.value = '全部'
  localStartDate.value = ''
  localEndDate.value = ''
  emitChange()
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
select, input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}
select:focus, input[type="date"]:focus {
  border-color: #4a90d9;
}
.sep {
  color: #aaa;
  font-size: 14px;
}
.btn-clear {
  padding: 6px 14px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-clear:hover {
  background: #eee;
}
</style>
