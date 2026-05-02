import { defineStore } from 'pinia'
import type { DarwinEvent } from '~/types/events'
import type { NeuronLane } from '~/types/canvas'

export const useCanvasStore = defineStore('canvas', () => {
  const events = ref<DarwinEvent[]>([])
  const neuronLanes = reactive<Record<string, NeuronLane>>({})

  const selectedEventId = ref<string | null>(null)
  const scrollX = ref(0)
  const zoomLevel = ref(1)
  const heartbeatSamples = ref<number[]>([])

  const trunkEvents = computed(() => events.value.filter((e) => !e.neuron_id))

  const maxTimestamp = computed(() =>
    events.value.length ? Math.max(...events.value.map((e) => e.timestamp_ms)) : 0,
  )

  function appendEvent(event: DarwinEvent) {
    if (events.value.some((e) => e.id === event.id)) return
    events.value.push(event)

    if (event.neuron_id) {
      if (!neuronLanes[event.neuron_id]) {
        neuronLanes[event.neuron_id] = {
          neuron_id: event.neuron_id,
          status: 'active',
          events: [],
          spawn_timestamp_ms: event.timestamp_ms,
          end_timestamp_ms: null,
        }
      }
      const lane = neuronLanes[event.neuron_id]
      if (!lane) return
      lane.events.push(event)
      if (event.event_type === 'NEURON_COMPLETED' || event.event_type === 'NEURON_FAILED') {
        lane.status = event.event_type === 'NEURON_COMPLETED' ? 'completed' : 'failed'
        lane.end_timestamp_ms = event.timestamp_ms
      }
    }

    if (event.event_type === 'THOUGHT' || event.event_type === 'LLM_INFERENCE') {
      const p = event.payload as { prompt_tokens?: number; completion_tokens?: number }
      const n = (p.prompt_tokens ?? 0) + (p.completion_tokens ?? 0)
      if (n > 0) pushHeartbeatSample(n)
    }
  }

  function pushHeartbeatSample(tokensPerBatch: number) {
    heartbeatSamples.value.push(tokensPerBatch)
    if (heartbeatSamples.value.length > 10) heartbeatSamples.value.shift()
  }

  function loadHistoricalEvents(historicalEvents: DarwinEvent[]) {
    events.value = []
    for (const k of Object.keys(neuronLanes)) delete neuronLanes[k]
    historicalEvents.forEach(appendEvent)
  }

  function selectEvent(eventId: string | null) {
    selectedEventId.value = eventId
  }

  function setScroll(x: number) {
    scrollX.value = Math.max(0, x)
  }

  function setZoom(level: number) {
    zoomLevel.value = Math.max(0.25, Math.min(4, level))
  }

  function reset() {
    events.value = []
    for (const k of Object.keys(neuronLanes)) delete neuronLanes[k]
    selectedEventId.value = null
    scrollX.value = 0
    zoomLevel.value = 1
    heartbeatSamples.value = []
  }

  return {
    events,
    neuronLanes,
    selectedEventId,
    scrollX,
    zoomLevel,
    heartbeatSamples,
    trunkEvents,
    maxTimestamp,
    appendEvent,
    loadHistoricalEvents,
    selectEvent,
    setScroll,
    setZoom,
    pushHeartbeatSample,
    reset,
  }
})
