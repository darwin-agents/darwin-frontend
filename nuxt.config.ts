// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: (title) => (title ? `${title} · Darwin Agents` : 'Darwin Agents'),
      meta: [
        { name: 'description', content: 'Autonomous economic organisms that earn, spend, reproduce or perish.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  routeRules: {
    '/': { isr: 60 },
    '/login': { isr: 60 },
    '/dashboard': { ssr: false },
    '/spawn': { ssr: false },
    '/canvas/**': { ssr: false },
    '/resolve': { ssr: false },
    '/confirm': { ssr: false },
    '/reset-password': { ssr: false },
  },

  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_PUBLISHABLE_KEY,
    types: '~/types/database.types.ts',
    // createBrowserClient (@supabase/ssr) forces flowType "pkce", which rejects
    // password-recovery redirects (implicit grant tokens in the URL hash).
    // Plain createClient keeps implicit flow so reset links establish a session.
    useSsrCookies: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/login', '/confirm', '/resolve', '/reset-password'],
    },
  },

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },
})
