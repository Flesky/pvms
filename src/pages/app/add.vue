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
</script>

<template>
  <div class="w-full p-4">
    <n-card header-style="padding-bottom: 8px;" title="Add voucher">
      <n-tabs size="large" type="line">
        <n-tab-pane name="Single">
          <n-form label-placement="left" :label-width="150">
            <n-form-item label="Value">
              <n-select v-model:value="formValue.value" class="max-w-xs" filterable :options="valueOptions" placeholder="" tag />
            </n-form-item>
            <n-form-item label="Expiry date">
              <n-date-picker v-model:formatted-value="formValue.expiry_date" placeholder="" type="date" value-format="yyyy-MM-dd" />
            </n-form-item>
            <n-form-item label="Count">
              <n-input-number v-model:value="formValue.voucher_count" :default-value="1" :min="0" placeholder="" />
            </n-form-item>
            <div class="flex">
              <n-button :loading="loading" type="primary" @click="run">
                Add voucher
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="File Upload">
          <n-upload :default-upload="false">
            <n-button>
              Upload file
            </n-button>
          </n-upload>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>
