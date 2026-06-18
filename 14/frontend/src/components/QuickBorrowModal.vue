<template>
  <el-dialog
    :model-value="visible"
    title="快速借用"
    width="460px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
    destroy-on-close
  >
    <div class="borrow-info" v-if="equipment">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          借用设备：<strong>{{ equipment.name }}</strong>（{{ equipment.code }}）
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
      <el-form-item label="借用人" prop="borrower">
        <el-input v-model="form.borrower" placeholder="请输入借用人姓名" maxlength="30" />
      </el-form-item>
      <el-form-item label="借用事由" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入借用事由"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="预计归还" prop="expectedReturnDate">
        <el-date-picker
          v-model="form.expectedReturnDate"
          type="date"
          placeholder="选择预计归还日期"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认借用（Enter）
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { borrowEquipment } from '@/services/borrowApi'
import { getTomorrow } from '@/utils'
import dayjs from 'dayjs'

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
  borrower: '',
  reason: '',
  expectedReturnDate: ''
})

const rules = {
  borrower: [{ required: true, message: '请输入借用人姓名', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入借用事由', trigger: 'blur' }],
  expectedReturnDate: [{ required: true, message: '请选择预计归还日期', trigger: 'change' }]
}

function disabledDate(time) {
  return time.getTime() < dayjs().startOf('day').add(1, 'day').toDate().getTime()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(form, {
        borrower: '',
        reason: '',
        expectedReturnDate: getTomorrow()
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
    const res = await borrowEquipment(props.equipment.id, form)
    if (res.success) {
      ElMessage.success(res.message || '借用成功')
      emit('success', res.data)
      emit('update:visible', false)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.borrow-info {
  margin-bottom: 8px;
}
</style>
