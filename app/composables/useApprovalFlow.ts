import type { DarwinEvent } from '~/types/events'

/**
 * Handles approve / deny actions for APPROVAL_REQUESTED events.
 * Calls PATCH /darwins/{id}/config to update requires_approval.
 */
export function useApprovalFlow(darwinId: Ref<string> | string) {
  const agent = useAgentStore()
  const notifications = useNotificationStore()
  const id = isRef(darwinId) ? darwinId : ref(darwinId)

  async function approve(event: DarwinEvent) {
    await agent.patchConfig(id.value, { requires_approval: false })
    notifications.resolve({ ...event, event_type: 'APPROVAL_GRANTED' } as DarwinEvent)
  }

  async function deny(event: DarwinEvent) {
    await agent.patchConfig(id.value, { requires_approval: true })
    notifications.resolve({ ...event, event_type: 'APPROVAL_DENIED' } as DarwinEvent)
  }

  return { approve, deny }
}
