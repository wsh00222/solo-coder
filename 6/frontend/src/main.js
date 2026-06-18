import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createToastStore } from './store/toast'
import './assets/styles.css'

const app = createApp(App)
const toastStore = createToastStore()
app.provide('toast', toastStore)
app.use(router)
app.mount('#app')
