// Install-to-home-screen state. plugins/pwa.client.ts feeds it the browser's events.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null

export function usePwaInstall() {
  const canInstall = useState('pwa-can-install', () => false)
  const installed = useState('pwa-installed', () => false)
  /** iOS Safari has no install prompt API: we show instructions instead. */
  const iosManual = useState('pwa-ios', () => false)

  function capture(e: Event) {
    e.preventDefault() // keep the native mini-infobar away; our button triggers it
    deferred = e as BeforeInstallPromptEvent
    canInstall.value = true
  }

  async function install() {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    canInstall.value = false
    return outcome === 'accepted'
  }

  return { canInstall, installed, iosManual, capture, install }
}
