<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()

const route = useRoute()
const darwinId = computed(() => String(route.params.id ?? ''))

const canvas = useCanvasStore()
const agent = useAgentStore()
const realtime = useRealtimeCanvas(darwinId)
const api = useApi()
const panels = useCanvasPanels()
const notifications = useNotificationStore()
const toast = useToast()

useHead({ title: () => agent.agent?.name ?? t('canvas.title') })

async function loadCanvas(id: string) {
  realtime.unsubscribe()
  canvas.reset()
  notifications.reset()
  panels.closeAllPanels()
  try {
    await agent.fetchAgent(id)
  } catch {
    toast(t('canvas.errors.loadAgent'), 'error')
    await navigateTo('/dashboard')
    return
  }

  // Subscribe before fetching history so nothing inserted in between is lost;
  // appendEvent / notifications.add dedupe by id.
  realtime.subscribe()
  try {
    const data = await api.get<{ events: import('~/types/events').DarwinEvent[] }>(
      `/darwins/${id}/events`,
      { limit: 2000, order: 'timestamp_ms.asc' },
    )
    // Route history like live events so pending approvals get banners and buttons.
    for (const e of data.events ?? []) realtime.routeEvent(e, false)
  } catch {
    toast(t('canvas.errors.loadHistory'), 'error')
  }
}

watch(
  darwinId,
  (id) => {
    if (id) void loadCanvas(id)
  },
  { immediate: true },
)

onUnmounted(() => {
  realtime.unsubscribe()
  panels.closeAllPanels()
  canvas.reset()
  notifications.reset()
})
</script>

<template>
  <div class="h-dvh min-h-0 w-screen overflow-hidden bg-darwin-bg flex flex-col">
    <CanvasTopBar :darwin-id="darwinId" />
    <CanvasInterventionBanner />
    <CanvasViewport :darwin-id="darwinId" class="flex-1 min-h-0" />
    <Teleport to="body">
      <ConsoleCommandConsole :darwin-id="darwinId" />
      <CanvasMentalReplayPanel :darwin-id="darwinId" />
      <PanelsEntityPanel />
      <PanelsSkillsPanel />
      <PanelsLedgerPanel />
      <PanelsAssetsPanel />
    </Teleport>
  </div>
</template>
