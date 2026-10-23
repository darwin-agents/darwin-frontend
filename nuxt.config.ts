// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://darwinagents.com').replace(/\/$/, '')
// App routes are private: keep them out of search and AI indexes.
const noindex = { 'x-robots-tag': 'noindex, nofollow' }
// The 8 most-spoken languages. Only the landing page gets per-language URLs (/es, /zh…);
// app routes keep one URL and follow the visitor's saved language (plugins/locale.client.ts).
const locales = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
  { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
  { code: 'hi', language: 'hi-IN', name: 'हिन्दी', file: 'hi.json' },
  { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
  { code: 'ar', language: 'ar', name: 'العربية', file: 'ar.json', dir: 'rtl' as const },
  { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
  { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.json' },
  { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json' },
]
const appPages = ['login', 'dashboard', 'spawn', 'canvas-id', 'resolve', 'confirm', 'reset-password']

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      meta: [
        { name: 'description', content: 'Raise a digital organism that earns its own living.' },
        { name: 'theme-color', content: '#f3eee2' },
        { property: 'og:site_name', content: 'Darwin Agents' },
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
    ...Object.fromEntries(locales.slice(1).map((l) => [`/${l.code}`, { isr: 60 }])),
    '/login': { ssr: false, headers: noindex },
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
      exclude: ['/', ...locales.slice(1).map((l) => `/${l.code}`), '/login', '/confirm', '/resolve', '/reset-password'],
    },
  },

  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales,
    customRoutes: 'config',
    pages: Object.fromEntries(appPages.map((p) => [p, false])),
    // '/' is ISR-cached: a server-side redirect by cookie or Accept-Language would be
    // cached for every visitor, so plugins/locale.client.ts detects in the browser.
    detectBrowserLanguage: false,
  },

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },
})
