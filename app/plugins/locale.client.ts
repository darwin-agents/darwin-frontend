// Language detection runs here, in the browser: '/' is ISR-cached, so a server-side redirect
// by cookie or Accept-Language would be cached for every visitor. A prefixed URL (/es) is an
// explicit choice; only default-locale URLs and the unprefixed app routes are re-routed.
export default defineNuxtPlugin({
  name: 'locale-detect',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    const saved = useCookie<string | null>('darwin-locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    const codes = i18n.localeCodes.value as string[]
    const browser = navigator.languages.map((l) => l.split('-')[0]!).find((l) => codes.includes(l))
    const wanted = (saved.value && codes.includes(saved.value) ? saved.value : browser) as typeof i18n.defaultLocale | undefined

    const apply = async () => {
      if (wanted && wanted !== i18n.defaultLocale && i18n.locale.value === i18n.defaultLocale) await i18n.setLocale(wanted)
      if (i18n.locale.value !== i18n.defaultLocale) saved.value = i18n.locale.value
      watch(i18n.locale, (l) => { saved.value = l })
    }
    // Server-rendered pages must hydrate in their own language before switching.
    if (nuxtApp.payload.serverRendered) onNuxtReady(apply)
    else await apply()
  },
})
