<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { TraceNode } from '~/types/canvas'
import { formatRelativeTime } from '~/utils/formatDuration'

const props = defineProps<{ darwinId: string }>()

const canvas = useCanvasStore()
const api = useApi()

const isOpen = computed(() => !!canvas.selectedEventId)
const selectedEvent = computed(
  () => canvas.events.find((e) => e.id === canvas.selectedEventId) ?? null,
)

const trace = ref<TraceNode[] | null>(null)
const isLoading = ref(false)

watch(
  () => canvas.selectedEventId,
  async (eventId) => {
    if (!eventId || !selectedEvent.value) {
      trace.value = null
      return
    }
    isLoading.value = true
    trace.value = null
    try {
      const data = await api.get<{ trace: TraceNode[] }>(`/darwins/${props.darwinId}/logs`, {
        session_id: selectedEvent.value.session_id,
        event_id: eventId,
        neuron_id: selectedEvent.value.neuron_id ?? '',
      })
      trace.value = data.trace ?? []
    } catch {
      trace.value = []
    } finally {
      isLoading.value = false
    }
  },
)

function close() {
  canvas.selectEvent(null)
}

function relativeTime(iso: string | undefined) {
  return formatRelativeTime(iso)
}

function modelTagClass(model: string): string {
  if (model.includes('opus'))    return 'model-tag--opus'
  if (model.includes('sonnet'))  return 'model-tag--sonnet'
  if (model.includes('haiku'))   return 'model-tag--haiku'
  if (model.includes('4o-mini')) return 'model-tag--gpt4omini'
  if (model.includes('4o'))      return 'model-tag--gpt4o'
  return 'model-tag--unknown'
}
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 h-screen w-full max-w-xl bg-darwin-surface border-l border-white/10 flex flex-col z-50 shadow-2xl"
    >
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 class="text-sm font-semibold text-white">Mental Replay</h2>
          <p class="text-xs text-slate-400">
            {{ selectedEvent?.event_type }} · {{ relativeTime(selectedEvent?.created_at) }}
          </p>
        </div>
        <button type="button" class="text-slate-400 hover:text-white p-1" aria-label="Close" @click="close">
          <X :size="18" />
        </button>
      </div>
      <div class="flex-1 grid grid-cols-2 gap-0 overflow-hidden min-h-0">
        <div class="border-r border-white/10 overflow-auto p-4">
          <p class="text-xs text-slate-500 mb-2 uppercase tracking-wider">Eyes</p>
          <img
            v-if="(selectedEvent?.payload as { screenshot_url?: string })?.screenshot_url"
            :src="(selectedEvent?.payload as { screenshot_url: string }).screenshot_url"
            class="w-full rounded border border-white/10"
            alt=""
          />
          <pre
            v-else-if="(selectedEvent?.payload as { content?: string })?.content"
            class="text-xs text-slate-300 whitespace-pre-wrap"
          >{{ (selectedEvent?.payload as { content: string }).content }}</pre>
          <p v-else class="text-xs text-slate-600 italic">No visual data for this event</p>
        </div>
        <div class="overflow-auto p-4 min-h-0">
          <p class="text-xs text-slate-500 mb-2 uppercase tracking-wider">Mind</p>
          <div v-if="isLoading" class="text-xs text-slate-500">Loading trace…</div>
          <div v-else-if="trace?.length" class="space-y-2">
            <div v-for="node in trace" :key="node.node_id" class="text-xs bg-white/5 rounded p-2">
              <span class="text-violet-400 font-mono">{{ node.type }}</span>
              <p class="mt-1 text-slate-300">{{ node.content }}</p>
              <div class="flex gap-3 mt-1 text-slate-500">
                <span v-if="node.token_cost">${{ node.token_cost.toFixed(5) }}</span>
                <span v-if="node.latency_ms">{{ node.latency_ms }}ms</span>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-600">No trace data.</p>
        </div>
      </div>
      <div class="p-3 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-400 shrink-0">
        <span v-if="(selectedEvent?.payload as { model?: string })?.model">
          Model:
          <span :class="['model-tag-inline', modelTagClass((selectedEvent?.payload as { model: string }).model)]">
            {{ (selectedEvent?.payload as { model: string }).model }}
          </span>
        </span>
        <span>Token cost: ${{ selectedEvent?.token_cost?.toFixed(5) ?? '—' }}</span>
        <span>Infra cost: ${{ selectedEvent?.fiat_cost?.toFixed(5) ?? '—' }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.model-tag-inline {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  border-radius: 3px;
  padding: 1px 5px;
  margin-left: 4px;
}
.model-tag--opus     { background: #E6F1FB; color: #185FA5; border: 1px solid #185FA5; }
.model-tag--sonnet   { background: #EEEDFE; color: #534AB7; border: 1px solid #534AB7; }
.model-tag--haiku    { background: #EAF3DE; color: #3B6D11; border: 1px solid #3B6D11; }
.model-tag--gpt4o    { background: #E1F5EE; color: #0F6E56; border: 1px solid #0F6E56; }
.model-tag--gpt4omini{ background: #FAEEDA; color: #854F0B; border: 1px solid #854F0B; }
.model-tag--unknown  { background: #1f2937; color: #9ca3af; border: 1px solid #374151; }
</style>
