<script setup lang="ts">
import type { NeuronLane } from '~/types/canvas'

const props = defineProps<{
  lane: NeuronLane
  isSelected?: boolean
}>()

const canvas = useCanvasStore()

const spawnModel = computed(() => {
  const spawnEvent = props.lane.events.find(e => e.event_type === 'NEURON_SPAWNED')
  return (spawnEvent?.payload?.model as string | undefined) ?? '—'
})

const modelDecisions = computed(() => {
  return props.lane.events
    .filter(e => e.event_type === 'THOUGHT' && e.payload.model)
    .map(e => ({ event_id: e.id, model: e.payload.model as string }))
})

const uniqueModels = computed(() => [...new Set(modelDecisions.value.map(d => d.model))])

const totalTokens = computed(() =>
  props.lane.events
    .filter(e => e.event_type === 'THOUGHT')
    .reduce((acc, e) => {
      const p = e.payload as { prompt_tokens?: number; completion_tokens?: number }
      return acc + (p.prompt_tokens ?? 0) + (p.completion_tokens ?? 0)
    }, 0),
)

const TOKEN_MAX = 100_000

const pctUsed = computed(() => Math.min((totalTokens.value / TOKEN_MAX) * 100, 100))

function modelTagClass(model: string): string {
  if (model.includes('opus'))    return 'model-tag--opus'
  if (model.includes('sonnet'))  return 'model-tag--sonnet'
  if (model.includes('haiku'))   return 'model-tag--haiku'
  if (model.includes('4o-mini')) return 'model-tag--gpt4omini'
  if (model.includes('4o'))      return 'model-tag--gpt4o'
  return 'model-tag--unknown'
}

function shortModel(m: string): string {
  if (m.includes('opus'))    return 'opus'
  if (m.includes('sonnet'))  return 'sonnet'
  if (m.includes('haiku'))   return 'haiku'
  if (m.includes('4o-mini')) return 'gpt-4o-mini'
  if (m.includes('4o'))      return 'gpt-4o'
  return m.split('-')[0] || m
}
</script>

<template>
  <div
    class="neuron-card rounded border p-3 cursor-pointer transition-colors"
    :class="isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'"
    @click="canvas.selectEvent(lane.events[0]?.id ?? null)"
  >
    <div class="flex items-center gap-2 mb-2">
      <span
        class="status-dot w-2 h-2 rounded-full shrink-0"
        :class="{
          'bg-violet-400 animate-pulse': lane.status === 'active',
          'bg-green-500': lane.status === 'completed',
          'bg-red-500': lane.status === 'failed',
        }"
      />
      <span class="text-xs font-mono text-slate-200 truncate flex-1">{{ lane.neuron_id }}</span>
      <span v-if="spawnModel !== '—'" :class="['model-tag', modelTagClass(spawnModel)]">
        {{ shortModel(spawnModel) }}
      </span>
    </div>

    <!-- Model switches list (shown only when more than one model was used) -->
    <div v-if="uniqueModels.length > 1" class="mb-2">
      <p class="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Model switches</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="m in uniqueModels"
          :key="m"
          :class="['model-tag', modelTagClass(m)]"
        >
          {{ shortModel(m) }}
        </span>
      </div>
    </div>

    <!-- Token bar -->
    <div class="h-1 rounded-full bg-white/10 overflow-hidden">
      <div
        class="h-full rounded-full bg-violet-500 transition-all"
        :style="{ width: `${pctUsed}%` }"
      />
    </div>
    <p class="text-[9px] text-slate-500 mt-1">{{ totalTokens.toLocaleString() }} tokens</p>
  </div>
</template>

<style scoped>
.model-tag {
  display: inline-block;
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 3px;
  padding: 1px 4px;
  white-space: nowrap;
}
.model-tag--opus     { background: #E6F1FB; color: #185FA5; border: 1px solid #185FA5; }
.model-tag--sonnet   { background: #EEEDFE; color: #534AB7; border: 1px solid #534AB7; }
.model-tag--haiku    { background: #EAF3DE; color: #3B6D11; border: 1px solid #3B6D11; }
.model-tag--gpt4o    { background: #E1F5EE; color: #0F6E56; border: 1px solid #0F6E56; }
.model-tag--gpt4omini{ background: #FAEEDA; color: #854F0B; border: 1px solid #854F0B; }
.model-tag--unknown  { background: #1f2937; color: #9ca3af; border: 1px solid #374151; }
</style>
