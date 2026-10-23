export default defineNuxtPlugin(() => {
  // Dev server stays SW-free so hot reload never fights a cache.
  if ('serviceWorker' in navigator && !import.meta.dev) void navigator.serviceWorker.register('/sw.js')

  const pwa = usePwaInstall()
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  pwa.installed.value = standalone
  pwa.iosManual.value = !standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)
  window.addEventListener('beforeinstallprompt', pwa.capture)
  window.addEventListener('appinstalled', () => {
    pwa.installed.value = true
    pwa.canInstall.value = false
  })
})
