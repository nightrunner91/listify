// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/listify/'
  },
  devServer: {
    port: 1146,
  },
  webpack: {
    extractCSS: true,
  },
  css: [
    '@/assets/styles/nightvue.scss'
  ],
})
