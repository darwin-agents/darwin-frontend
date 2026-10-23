import { defineStore } from 'pinia'
import type { DarwinEvent } from '~/types/events'

export interface PendingIntervention {
  id: string
  event_type: string
  payload: Record<string, unknown>
  received_at: string
  resolved: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const interventions = ref<PendingIntervention[]>([])

  const pending = computed(() => interventions.value.filter((i) => !i.resolved))

  function add(event: DarwinEvent) {
    if (interventions.value.some((i) => i.id === event.id)) return
    interventions.value.push({
      id: event.id,
      event_type: event.event_type,
      payload: event.payload,
      received_at: new Date().toISOString(),
      resolved: false,
    })
  }

  function resolve(event: DarwinEvent) {
    const pendingMap: Record<string, string> = {
      ASK_HUMAN_RESOLVED: 'ASK_HUMAN_SENT',
      CAPTCHA_SOLVED: 'CAPTCHA_DELEGATED',
      APPROVAL_GRANTED: 'APPROVAL_REQUESTED',
      APPROVAL_DENIED: 'APPROVAL_REQUESTED',
    }
    const triggerId = pendingMap[event.event_type]
    if (!triggerId) return
    const open = interventions.value.filter((i) => i.event_type === triggerId && !i.resolved)
    const match = open.find((i) => i.id === event.parent_event_id) ?? open[0]
    if (match) match.resolved = true
  }

  function dismiss(id: string) {
    const item = interventions.value.find((i) => i.id === id)
    if (item) item.resolved = true
  }

  function reset() {
    interventions.value = []
  }

  return { interventions, pending, add, resolve, dismiss, reset }
})
