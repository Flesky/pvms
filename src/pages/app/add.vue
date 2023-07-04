<script setup lang="tsx">
import type { FormSchema } from '@/components/app/form/types'

definePage({
  name: 'Add',
})

const feedback = ref()
const fileList = ref([])
const message = useMessage()
const formValue = ref({
  voucher_count: 1,
})

const schema: FormSchema = {
  value: {
    type: 'select',
    label: 'Value',
    custom: true,
    options: ['100', '200', '300', '400', '500', '1000'].map(value => ({ label: value, value })),
  },
  expiry_date: {
    type: 'date',
    label: 'Expiration Date',
  },
  voucher_count: {
    type: 'number',
    label: 'Count',
    min: 1,
    buttons: true,
  },
  service_reference: {
    type: 'input',
    label: 'Service Reference',
  },
}
const { loading, error, run } = useRequest(() => axios.post(formValue.value.voucher_count === 1 ? '/voucher' : '/voucher-multiple', formValue.value), {
  manual: true,
  onSuccess: () => {
    message.success('Voucher added')
  },
})

const { loading: uploading, run: upload } = useRequest(() => {
  const formData = new FormData()
  formData.append('file', fileList.value[0].file)
  return axios.post('/voucher-file', formData)
}, {
  manual: true,
  onSuccess: () => {
    fileList.value = []
    message.success('Voucher/s added')
  },
})
</script>

<template>
  <div class="w-full p-4">
    <n-card header-style="padding-bottom: 8px;" title="Add voucher">
      <n-tabs size="large" type="line">
        <n-tab-pane class="max-w-lg" name="Manual Input">
          <app-form :label-width="150" :model="formValue">
            <app-form-items v-model="formValue" :feedback="feedback" :schema="schema" />
          </app-form>
          <div class="flex">
            <n-button :loading="loading" type="primary" @click="run">
              Add voucher
            </n-button>
          </div>
        </n-tab-pane>

        <n-tab-pane name="File Upload">
          <n-space vertical>
            <n-upload
              v-model:file-list="fileList"
              :max="1"
            >
              <n-upload-dragger class="flex flex-col items-center">
                <n-icon class="mb-4" :depth="3" size="48">
                  <i-archive />
                </n-icon>
                <n-text style="font-size: 16px">
                  Click or drag file to this area to upload
                </n-text>
              </n-upload-dragger>
            </n-upload>
            <n-collapse-transition :show="!!fileList.length">
              <n-button :loading="uploading" type="primary" @click="upload">
                Upload
              </n-button>
            </n-collapse-transition>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>
