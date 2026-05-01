import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useStorage } from 'vue3-storage'
import App from './App.vue'
import router from './router'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'

/** fonts and stylesheets */
import '@/assets/styles/nightvue.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'flag-icons/css/flag-icons.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)

export const lyStorage = useStorage('ly_')

const authStore = useAuthStore()

authStore.fetchMe().then(() => {
  app.use(router)
  app.mount('#app')
})
