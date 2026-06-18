<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑设备' : '添加设备'"
    width="520px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      @keyup.enter="handleSubmit"
    >
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入设备名称" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="设备编号" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入设备编号（唯一）"
          maxlength="30"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item label="规格型号" prop="model">
        <el-input v-model="form.model" placeholder="请输入规格型号" maxlength="100" clearable />
      </el-form-item>
      <el-form-item label="所在位置" prop="location">
        <el-input v-model="form.location" placeholder="如：A区-3楼" maxlength="100" clearable />
      </el-form-item>
      <el-form-item label="设备状态" prop="status" v-if="!isEdit">
        <el-select v-model="form.status" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="status" v-else>
        <el-select v-model="form.status" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认添加' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createEquipment, updateEquipment } from '@/services/equipmentApi'
import { STATUS_OPTIONS } from '@/utils'

const props = defineProps({
  visible: Boolean,
  equipment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const statusOptions = STATUS_OPTIONS
const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)

const form = reactive({
  name: '',
  code: '',
  model: '',
  location: '',
  status: 'available'
})

const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      isEdit.value = !!props.equipment
      if (props.equipment) {
        Object.assign(form, {
          name: props.equipment.name || '',
          code: props.equipment.code || '',
          model: props.equipment.model || '',
          location: props.equipment.location || '',
          status: props.equipment.status || 'available'
        })
      } else {
        Object.assign(form, {
          name: '',
          code: '',
          model: '',
          location: '',
          status: 'available'
        })
      }
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
    let res
    if (isEdit.value) {
      res = await updateEquipment(props.equipment.id, form)
    } else {
      res = await createEquipment(form)
    }
    if (res.success) {
      ElMessage.success(res.message || '操作成功')
      emit('success', res.data)
      emit('update:visible', false)
    }
  } finally {
    loading.value = false
  }
}
</script>
