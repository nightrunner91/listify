/** essentials */
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

/** plugins */
import { createPinia } from 'pinia'
import router from './router'
import Vue3Storage from 'vue3-storage'

/** fonts and stylesheets */
import '@/assets/styles/nightvue.scss'

/** plugins */
const pinia = createPinia()
app
  .use(pinia)
  .use(router)
  .use(Vue3Storage, { namespace: 'ly_' })


/** mount app */
app.mount('#app')
