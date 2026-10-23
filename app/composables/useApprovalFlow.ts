import type { DarwinEvent } from '~/types/events'

/**
 * Handles approve / deny actions for APPROVAL_REQUESTED events.
 * Calls PATCH /darwins/{id}/config to update requires_approval.
 */
export function useApprovalFlow(darwinId: MaybeRefOrGetter<string>) {
  const agent = useAgentStore()
  const notifications = useNotificationStore()

  async function approve(event: DarwinEvent) {
    await agent.patchConfig(toValue(darwinId), { requires_approval: false })
    notifications.resolve({ ...event, event_type: 'APPROVAL_GRANTED', parent_event_id: event.id })
  }

  async function deny(event: DarwinEvent) {
    await agent.patchConfig(toValue(darwinId), { requires_approval: true })
    notifications.resolve({ ...event, event_type: 'APPROVAL_DENIED', parent_event_id: event.id })
  }

  return { approve, deny }
}
