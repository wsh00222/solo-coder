<template>
  <div class="record-list">
    <RecordItem
      v-for="record in records"
      :key="record.id"
      :record="record"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
    <EmptyState v-if="records.length === 0" />
    <div v-if="records.length > 0" class="record-count">
      共 {{ records.length }} 条记录
    </div>
  </div>
</template>

<script setup>
import RecordItem from './RecordItem.vue'
import EmptyState from './EmptyState.vue'

defineProps({
  records: { type: Array, required: true }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.record-count {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  padding: 16px 0 8px;
}
</style>
