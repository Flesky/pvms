import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/utils/router'

import './assets/main.css'
import auth from '@/utils/auth'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

const pinia = createPinia()

auth.startup().then((isOk) => {
  if (isOk) {
    const app = createApp(App)
    app.use(pinia)
    app.use(router)
    app.mount('#app')
  }
})
