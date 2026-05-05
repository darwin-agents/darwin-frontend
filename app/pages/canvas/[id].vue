<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const darwinId = computed(() => String(route.params.id ?? ''))

const canvas = useCanvasStore()
const agent = useAgentStore()
const realtime = useRealtimeCanvas(darwinId)
const api = useApi()
const panels = useCanvasPanels()

async function loadCanvas(id: string) {
  canvas.reset()
  panels.closeAllPanels()
  try {
    await agent.fetchAgent(id)
  } catch {
    await navigateTo('/dashboard')
    return
  }

  try {
    const data = await api.get<{ events: import('~/types/events').DarwinEvent[] }>(
      `/darwins/${id}/events`,
      { limit: 2000, order: 'timestamp_ms.asc' },
    )
    canvas.loadHistoricalEvents(data.events ?? [])
  } catch {
    canvas.loadHistoricalEvents([])
  }

  realtime.unsubscribe()
  realtime.subscribe()
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
