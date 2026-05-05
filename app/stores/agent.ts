import { defineStore } from 'pinia'
import type { AgentState, DarwinAgent } from '~/types/agent'
import type { DarwinEvent } from '~/types/events'

export const useAgentStore = defineStore('agent', () => {
  const agent = ref<DarwinAgent | null>(null)
  const state = ref<AgentState>('PROVISIONING')
  const balance = ref(0)
  const burnRatePerHour = ref(0)
  const sessionId = ref<string | null>(null)
  const isAutonomyEnabled = ref(false)
  const lastEventAt = ref<string | null>(null)
  const pendingInitialBudget = ref<number | null>(null)

  const pctRemaining = computed(() => {
    const cap = agent.value?.initial_budget ?? 0
    if (cap <= 0) return 0
    return Math.min(100, Math.max(0, (balance.value / cap) * 100))
  })
  const isActive = computed(() => state.value === 'ACTIVE')
  const isHibernating = computed(() => state.value === 'HIBERNATING')
  const isTerminated = computed(() => state.value === 'TERMINATED')

  function handleLifecycleEvent(event: DarwinEvent) {
    lastEventAt.value = new Date().toISOString()
    const p = event.payload as Record<string, unknown>
    switch (event.event_type) {
      case 'AGENT_SPAWNED':
        state.value = 'ACTIVE'
        sessionId.value = event.session_id
        if (typeof p.initial_budget === 'number') {
          balance.value = p.initial_budget
          if (agent.value) agent.value.initial_budget = p.initial_budget
        }
        break
      case 'AGENT_WOKE':
        state.value = 'ACTIVE'
        sessionId.value = event.session_id
        if (typeof p.balance_at_wake === 'number') balance.value = p.balance_at_wake
        break
      case 'AGENT_HIBERNATED':
        state.value = 'HIBERNATING'
        sessionId.value = null
        break
      case 'AGENT_TERMINATED':
        state.value = 'TERMINATED'
        sessionId.value = null
        if (typeof p.final_balance === 'number') balance.value = p.final_balance
        break
    }
  }

  function updateBalance(newBalance: number) {
    balance.value = newBalance
  }

  async function fetchAgent(darwinId: string) {
    const api = useApi()
    const data = await api.get<{
      agent_id: string
      name: string
      state: AgentState
      budget_remaining_usd: number
      burn_rate_usd_per_hour: number
      last_active_at: string | null
      next_wake_at: string | null
      // Backward-compatible backend shape (legacy /state response)
      ledger_balance?: number
      burn_rate_per_hour?: number
      current_session_id?: string | null
      last_event_at?: string | null
    }>(`/darwins/${darwinId}/state`)

    const agentId = data.agent_id ?? darwinId
    const budgetRemaining = data.budget_remaining_usd ?? data.ledger_balance ?? 0
    const burnPerHour = data.burn_rate_usd_per_hour ?? data.burn_rate_per_hour ?? 0
    const derivedName = data.name ?? `Darwin ${agentId.slice(0, 8)}`

    agent.value = {
      id: agentId,
      name: derivedName,
      initial_budget:
        pendingInitialBudget.value ??
        (agent.value?.initial_budget && agent.value.initial_budget > 0
          ? agent.value.initial_budget
          : Math.max(budgetRemaining, 1)),
    }
    pendingInitialBudget.value = null
    state.value = data.state
    balance.value = budgetRemaining
    burnRatePerHour.value = burnPerHour
    sessionId.value = data.current_session_id ?? sessionId.value
    lastEventAt.value = data.last_event_at ?? data.last_active_at ?? lastEventAt.value
  }

  function setInitialBudgetFromSpawn(initialBudget: number) {
    pendingInitialBudget.value = initialBudget
  }

  async function postUplink(darwinId: string, message: string, attachments: object[] = []) {
    const api = useApi()
    await api.post(`/darwins/${darwinId}/uplink`, { message, attachments })
  }

  async function patchConfig(
    darwinId: string,
    patch: { requires_approval?: boolean; budget_injection?: number },
  ) {
    const api = useApi()
    await api.patch(`/darwins/${darwinId}/config`, patch)
    if (patch.requires_approval !== undefined) {
      isAutonomyEnabled.value = !patch.requires_approval
    }
    if (patch.budget_injection != null && patch.budget_injection > 0) {
      balance.value += patch.budget_injection
    }
  }

  async function terminate(darwinId: string) {
    const api = useApi()
    await api.post(`/darwins/${darwinId}/terminate`, {
      agent_id: darwinId,
      reason: 'kill_switch',
      initiated_by: 'user',
    })
    state.value = 'TERMINATED'
  }

  return {
    agent,
    state,
    balance,
    burnRatePerHour,
    sessionId,
    isAutonomyEnabled,
    lastEventAt,
    pctRemaining,
    isActive,
    isHibernating,
    isTerminated,
    handleLifecycleEvent,
    updateBalance,
    fetchAgent,
    setInitialBudgetFromSpawn,
    postUplink,
    patchConfig,
    terminate,
  }
})
