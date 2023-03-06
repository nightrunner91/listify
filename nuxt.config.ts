// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/listify/',
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&family=Nunito+Sans:wght@400;500&display=swap',
        },
      ],
    },
  },
  devServer: {
    port: 1146,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/@core/globals.scss" as *;'
        }
      }
    }
  },
  modules: [
    '@pinia/nuxt',
  ],
})
