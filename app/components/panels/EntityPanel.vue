<script setup lang="ts">
const canvas = useCanvasStore()
const panels = useCanvasPanels()

const entities = computed(() => {
  const map = new Map<string, { type: string; data: Record<string, unknown>; updated_at: string }>()
  for (const e of canvas.events) {
    if (e.event_type !== 'ENTITY_CREATED' && e.event_type !== 'ENTITY_UPDATED') continue
    const p = e.payload as { entity_id?: string; entity_type?: string; data?: Record<string, unknown> }
    if (!p.entity_id) continue
    map.set(p.entity_id, {
      type: String(p.entity_type ?? 'entity'),
      data: p.data ?? {},
      updated_at: e.created_at,
    })
  }
  return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }))
})

const grouped = computed(() => {
  return entities.value.reduce(
    (acc, e) => {
      const t = e.type
      if (!acc[t]) acc[t] = []
      acc[t].push(e)
      return acc
    },
    {} as Record<string, typeof entities.value>,
  )
})

function entityDisplayName(entity: { data: Record<string, unknown> }) {
  const d = entity.data
  if (typeof d.name === 'string') return d.name
  if (typeof d.title === 'string') return d.title
  return 'Entity'
}
</script>

<template>
  <div
    v-if="panels.showEntityPanel"
    class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/10 z-30 flex flex-col"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h2 class="text-sm font-semibold text-white">Entities</h2>
      <button type="button" class="text-slate-400 text-sm" @click="panels.closeEntityPanel()">Close</button>
    </div>
    <div class="flex-1 overflow-auto">
      <div v-for="(items, type) in grouped" :key="type" class="mb-4">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-1 sticky top-0 bg-darwin-surface">
          {{ type }} ({{ items.length }})
        </h3>
        <div
          v-for="entity in items"
          :key="entity.id"
          class="px-4 py-2 border-b border-white/5 hover:bg-white/5 cursor-pointer"
        >
          <p class="text-sm text-white">{{ entityDisplayName(entity) }}</p>
          <p class="text-xs text-slate-500">{{ entity.updated_at }}</p>
          <details class="mt-1">
            <summary class="text-xs text-slate-600 cursor-pointer">View data</summary>
            <pre class="text-xs text-slate-400 mt-1 overflow-auto">{{ JSON.stringify(entity.data, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
