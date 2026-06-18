<template>
  <el-dialog
    :model-value="visible"
    title="归还设备"
    width="460px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
    destroy-on-close
  >
    <div class="return-info" v-if="equipment">
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>
          归还设备：<strong>{{ equipment.name }}</strong>（{{ equipment.code }}）
        </template>
      </el-alert>
    </div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      style="margin-top: 16px"
      @keyup.enter="handleSubmit"
    >
      <el-form-item label="实际归还" prop="actualReturnDate">
        <el-date-picker
          v-model="form.actualReturnDate"
          type="date"
          placeholder="选择实际归还日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="转为维修">
        <el-checkbox v-model="form.toMaintenance">
          归还后将设备状态设为「维修中」
        </el-checkbox>
        <div class="checkbox-tip">
          <el-icon size="12" color="#909399"><InfoFilled /></el-icon>
          若勾选，归还后设备状态将变为"维修中"而非"可用"
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认归还
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { returnEquipment } from '@/services/borrowApi'
import { getToday } from '@/utils'

const props = defineProps({
  visible: Boolean,
  equipment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  actualReturnDate: '',
  toMaintenance: false
})

const rules = {
  actualReturnDate: [{ required: true, message: '请选择实际归还日期', trigger: 'change' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(form, {
        actualReturnDate: getToday(),
        toMaintenance: false
      })
    }
  }
)

function handleClose() {
  formRef.value?.resetFields()
}

async function handleSubmit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await returnEquipment(props.equipment.id, form)
    if (res.success) {
      ElMessage.success(res.message || '归还成功')
      emit('success', res.data)
      emit('update:visible', false)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.return-info {
  margin-bottom: 8px;
}
.checkbox-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
