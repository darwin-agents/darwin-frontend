<script setup lang="ts">
import { X, Loader2, Eye, Brain } from 'lucide-vue-next'
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
      class="fixed right-0 top-0 h-screen w-full max-w-[640px] bg-darwin-surface border-l border-white/[0.06] flex flex-col z-50 shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <div>
          <h2 class="text-sm font-semibold text-white flex items-center gap-2">
            <Brain :size="14" class="text-violet-400" />
            Mental Replay
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            {{ selectedEvent?.event_type }} · {{ relativeTime(selectedEvent?.created_at) }}
          </p>
        </div>
        <button type="button" class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all" aria-label="Close" @click="close">
          <X :size="16" />
        </button>
      </div>

      <!-- Content: two-panel layout -->
      <div class="flex-1 grid grid-cols-2 gap-0 overflow-hidden min-h-0">
        <!-- Left: EYES -->
        <div class="border-r border-white/[0.06] overflow-auto p-4">
          <div class="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-3">
            <Eye :size="10" />
            Eyes
          </div>
          <img
            v-if="(selectedEvent?.payload as { screenshot_url?: string })?.screenshot_url"
            :src="(selectedEvent?.payload as { screenshot_url: string }).screenshot_url"
            class="w-full rounded-lg border border-white/[0.06]"
            alt="Browser screenshot"
          />
          <pre
            v-else-if="(selectedEvent?.payload as { content?: string })?.content"
            class="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]"
          >{{ (selectedEvent?.payload as { content: string }).content }}</pre>
          <p v-else class="text-xs text-slate-600 italic">No visual data for this event</p>
        </div>

        <!-- Right: MIND -->
        <div class="overflow-auto p-4 min-h-0">
          <div class="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-3">
            <Brain :size="10" />
            Mind
          </div>
          <div v-if="isLoading" class="flex items-center gap-2 text-xs text-slate-500 py-8 justify-center">
            <Loader2 :size="14" class="animate-spin" />
            Loading trace…
          </div>
          <div v-else-if="trace?.length" class="space-y-2">
            <div
              v-for="node in trace"
              :key="node.node_id"
              class="text-xs bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]"
            >
              <span class="text-violet-400 font-mono text-[10px]">{{ node.type }}</span>
              <p class="mt-1.5 text-slate-300 leading-relaxed">{{ node.content }}</p>
              <div class="flex gap-3 mt-2 text-[10px] text-slate-600">
                <span v-if="node.token_cost">${{ node.token_cost.toFixed(5) }}</span>
                <span v-if="node.latency_ms">{{ node.latency_ms }}ms</span>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-600 py-8 text-center">No trace data available.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-white/[0.06] flex flex-wrap gap-4 text-xs text-slate-500 shrink-0">
        <span v-if="(selectedEvent?.payload as { model?: string })?.model">
          Model:
          <span :class="['model-tag-inline', modelTagClass((selectedEvent?.payload as { model: string }).model)]">
            {{ (selectedEvent?.payload as { model: string }).model }}
          </span>
        </span>
        <span>Token: ${{ selectedEvent?.token_cost?.toFixed(5) ?? '—' }}</span>
        <span>Infra: ${{ selectedEvent?.fiat_cost?.toFixed(5) ?? '—' }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.model-tag-inline {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: 4px;
}
.model-tag--opus     { background: #185FA520; color: #7cb3e0; border: 1px solid #185FA540; }
.model-tag--sonnet   { background: #534AB720; color: #a89fe0; border: 1px solid #534AB740; }
.model-tag--haiku    { background: #3B6D1120; color: #8abf60; border: 1px solid #3B6D1140; }
.model-tag--gpt4o    { background: #0F6E5620; color: #5ac0a0; border: 1px solid #0F6E5640; }
.model-tag--gpt4omini{ background: #854F0B20; color: #c89040; border: 1px solid #854F0B40; }
.model-tag--unknown  { background: #1f293740; color: #9ca3af; border: 1px solid #37415140; }
</style>
