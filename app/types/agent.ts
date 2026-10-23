export type AgentState = 'PROVISIONING' | 'ACTIVE' | 'HIBERNATING' | 'TERMINATED'

export interface DarwinAgent {
  id: string
  name: string
  initial_budget: number
}

/** Matches `AgentStateResponse` from darwin-backend. */
export interface AgentStateApi {
  agent_id: string
  name: string
  state: AgentState
  budget_remaining_usd: number
  burn_rate_usd_per_hour: number
  last_active_at: string | null
  next_wake_at: string | null
}
