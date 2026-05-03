<script setup lang="ts">
import { X, Database } from 'lucide-vue-next'
import { formatRelativeTime } from '~/utils/formatDuration'

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
  <Transition name="slide-right">
    <div
      v-if="panels.showEntityPanel"
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/[0.06] z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <Database :size="14" class="text-cyan-400" />
          Entities
        </h2>
        <button type="button" class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all" @click="panels.closeEntityPanel()">
          <X :size="16" />
        </button>
      </div>
      <div v-if="!entities.length" class="flex-1 flex items-center justify-center">
        <p class="text-xs text-slate-600">No entities created yet.</p>
      </div>
      <div v-else class="flex-1 overflow-auto">
        <div v-for="(items, type) in grouped" :key="type" class="mb-2">
          <h3 class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2 sticky top-0 bg-darwin-surface/90 backdrop-blur-sm">
            {{ type }} ({{ items.length }})
          </h3>
          <div
            v-for="entity in items"
            :key="entity.id"
            class="px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
          >
            <p class="text-sm text-white">{{ entityDisplayName(entity) }}</p>
            <p class="text-[11px] text-slate-600 mt-0.5">{{ formatRelativeTime(entity.updated_at) }}</p>
            <details class="mt-2">
              <summary class="text-[11px] text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">View data</summary>
              <pre class="text-[11px] text-slate-400 mt-2 overflow-auto bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04] font-mono">{{ JSON.stringify(entity.data, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
