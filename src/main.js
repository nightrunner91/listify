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

/** plugins */
const pinia = createPinia()
app
  .use(pinia)
  .use(router)

export const lyStorage = useStorage('ly_')

/** mount app */
app.mount('#app')
