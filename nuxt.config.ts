// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { isr: 60 },
    '/login': { isr: 60 },
    '/dashboard': { ssr: false },
    '/spawn': { ssr: false },
    '/canvas/**': { ssr: false },
    '/resolve': { ssr: false },
  },

  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    types: '~/types/database.types.ts',
    redirectOptions: {
      login: '/login',
      callback: '/dashboard',
      exclude: ['/', '/login', '/resolve'],
    },
  },

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },
})
