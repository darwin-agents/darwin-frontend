// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://darwinagents.com').replace(/\/$/, '')
// App routes are private: keep them out of search and AI indexes.
const noindex = { 'x-robots-tag': 'noindex, nofollow' }

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
        { name: 'description', content: 'Raise a digital organism that earns its own living.' },
        { name: 'theme-color', content: '#f3eee2' },
        { property: 'og:site_name', content: 'Darwin Agents' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: `${siteUrl}/og.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Darwin Agents — the autonomous economic engine' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${siteUrl}/og.png` },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'text/markdown', href: '/llms.txt', title: 'Darwin Agents for LLMs' },
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
    '/login': { isr: 60, headers: noindex },
    '/dashboard': { ssr: false, headers: noindex },
    '/spawn': { ssr: false, headers: noindex },
    '/canvas/**': { ssr: false, headers: noindex },
    '/resolve': { ssr: false, headers: noindex },
    '/confirm': { ssr: false, headers: noindex },
    '/reset-password': { ssr: false, headers: noindex },
    // Browsers must re-check the service worker on every visit to pick up updates.
    '/sw.js': { headers: { 'cache-control': 'no-cache' } },
  },

  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
    public: { siteUrl },
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
