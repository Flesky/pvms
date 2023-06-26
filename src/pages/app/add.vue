<script setup lang="tsx">
definePage({
  name: 'Add',
})

const formValue = ref({})
const valueOptions = [
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
]

const message = useMessage()
const { loading, error, run } = useRequest(() => axios.post('/voucher-multiple', formValue.value), {
  manual: true,
  onSuccess: () => {
    message.success('Voucher added')
  },
})

const fileList = ref([])
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
        <n-tab-pane name="Manual Input">
          <n-form label-placement="left" :label-width="150">
            <n-form-item label="Value">
              <n-select v-model:value="formValue.value" class="max-w-xs" filterable :options="valueOptions" placeholder="" tag />
            </n-form-item>
            <n-form-item label="Expiry date">
              <n-date-picker v-model:formatted-value="formValue.expiry_date" placeholder="" type="date" value-format="yyyy-MM-dd" />
            </n-form-item>
            <n-form-item label="Count">
              <n-input-number v-model:value="formValue.voucher_count" :default-value="1" :min="1" placeholder="" />
            </n-form-item>
            <div class="flex">
              <n-button :loading="loading" type="primary" @click="run">
                Add voucher
              </n-button>
            </div>
          </n-form>
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
            <n-collapse-transition :collapsed="!!fileList.length">
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
