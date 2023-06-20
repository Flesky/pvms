<script setup>
const formValue = ref({
  email: 'test@smsglobal.net',
  password: 'password',
})

const router = useRouter()

// TODO: Reimplement proper auth
const { loading, error, run } = useRequest(() => axios.post('/login', formValue.value), {
  manual: true,
  onSuccess: (data) => {
    localStorage.setItem('access_token', data.data.access_token)
    axios.defaults.headers.common.Authorization = `Bearer ${data.data.access_token}`
    router.push('/')
  },
})
</script>

<template>
  <n-layout class="h-full" embedded>
    <div class="flex h-full flex-col items-center justify-center gap-4">
      <img class="w-40" src="/logo.svg">
      <n-card class="max-w-sm">
        <n-form class="w-full">
          <n-form-item label="Email address">
            <n-input v-model:value="formValue.email" disabled placeholder="" />
          </n-form-item>
          <n-form-item label="Password">
            <n-input v-model:value="formValue.password" disabled placeholder="" type="password" />
          </n-form-item>
        </n-form>
        <n-button v-bind="{ loading }" block type="primary" @click="run">
          Log in
        </n-button>
      </n-card>
    </div>
  </n-layout>
</template>
