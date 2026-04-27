/** essentials */
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

/** plugins */
import { createPinia } from 'pinia'
import router from './router'
import { useStorage } from 'vue3-storage'

/** fonts and stylesheets */
import '@/assets/styles/nightvue.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'flag-icons/css/flag-icons.min.css'

/** plugins */
import i18n from '@/i18n'
const pinia = createPinia()
app.use(pinia)
app.use(i18n)

export const lyStorage = useStorage('ly_')

import { useAuthStore } from '@/stores/auth.store'
const authStore = useAuthStore()

authStore.fetchMe().then(() => {
  app.use(router)
  app.mount('#app')
})
