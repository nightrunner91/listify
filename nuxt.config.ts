// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/listify/'
  },
  devServer: {
    port: 1146,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/nightvue.scss" as *;'
        }
      }
    }
  }
})
