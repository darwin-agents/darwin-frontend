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

export interface AgentListApi {
  agents: AgentStateApi[]
  total: number
}

export interface SpawnAgentBody {
  name: string
  directive: string
  budget_usd: number
  wake_up_cron?: string | null
  owner_id: string
  swarm_id?: string | null
  tags?: string[]
}

export interface SpawnAgentResponse {
  agent_id: string
  state: AgentState
  modal_container_id: string | null
  created_at: string
  vcc_ref: string
}
