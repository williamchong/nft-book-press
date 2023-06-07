// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['@/assets/styles/global.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/eslint-module'
  ],
  plugins: ['~/plugins/buffer.ts']
})
