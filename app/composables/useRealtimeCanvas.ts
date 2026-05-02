import { useSupabaseClient } from '#imports'
import type { Ref } from 'vue'
import { useCanvasStore } from '~/stores/canvas'
import { useAgentStore } from '~/stores/agent'
import { useNotificationStore } from '~/stores/notification'
import type { DarwinEvent } from '~/types/events'

export function useRealtimeCanvas(darwinId: Ref<string>) {
  const supabase = useSupabaseClient()
  const canvas = useCanvasStore()
  const agent = useAgentStore()
  const notifications = useNotificationStore()

  let channel: ReturnType<typeof supabase.channel> | null = null

  function routeEvent(event: DarwinEvent) {
    canvas.appendEvent(event)

    if (
      ['AGENT_SPAWNED', 'AGENT_WOKE', 'AGENT_HIBERNATED', 'AGENT_TERMINATED'].includes(
        event.event_type,
      )
    ) {
      agent.handleLifecycleEvent(event)
    }

    if (['LEDGER_DEBIT', 'LEDGER_CREDIT'].includes(event.event_type)) {
      const p = event.payload as { balance_after?: number }
      if (typeof p.balance_after === 'number') agent.updateBalance(p.balance_after)
    }

    if (['ASK_HUMAN_SENT', 'APPROVAL_REQUESTED', 'CAPTCHA_DELEGATED'].includes(event.event_type)) {
      notifications.add(event)
    }

    if (
      ['ASK_HUMAN_RESOLVED', 'APPROVAL_GRANTED', 'APPROVAL_DENIED', 'CAPTCHA_SOLVED'].includes(
        event.event_type,
      )
    ) {
      notifications.resolve(event)
    }
  }

  function subscribe() {
    unsubscribe()
    const id = darwinId.value
    if (!id) return

    channel = supabase
      .channel(`darwin:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'darwin_events',
          filter: `darwin_id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as DarwinEvent
          routeEvent(row)
        },
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      void supabase.removeChannel(channel)
      channel = null
    }
  }

  return { subscribe, unsubscribe, routeEvent }
}
