export type EventType =
  | 'AGENT_SPAWNED'
  | 'AGENT_WOKE'
  | 'AGENT_HIBERNATED'
  | 'AGENT_TERMINATED'
  | 'THOUGHT'
  | 'TOOL_CALL'
  | 'TOOL_RESULT'
  | 'LLM_INFERENCE'
  | 'NEURON_SPAWNED'
  | 'NEURON_COMPLETED'
  | 'NEURON_FAILED'
  | 'SYNAPTIC_INTEGRATION'
  | 'BROWSER_FETCH'
  | 'BROWSER_SESSION_OPEN'
  | 'BROWSER_SCREENSHOT'
  | 'BROWSER_CLICK'
  | 'BROWSER_TYPE'
  | 'BROWSER_SESSION_CLOSE'
  | 'LEDGER_DEBIT'
  | 'LEDGER_CREDIT'
  | 'VCC_INJECTED'
  | 'USDC_TX'
  | 'ASK_HUMAN_SENT'
  | 'ASK_HUMAN_RESOLVED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_DENIED'
  | 'CAPTCHA_DELEGATED'
  | 'CAPTCHA_SOLVED'
  | 'SKILL_CREATED'
  | 'SKILL_LOADED'
  | 'EPISODIC_SUMMARY_WRITTEN'
  | 'ENTITY_CREATED'
  | 'ENTITY_UPDATED'
  | 'CIRCUIT_BREAKER_TRIPPED'
  | 'UPLINK_INJECTED'
  | 'CONFIG_UPDATED'
  | string

export interface DarwinEvent {
  id: string
  darwin_id: string
  session_id: string
  neuron_id: string | null
  parent_event_id: string | null
  event_type: EventType
  payload: Record<string, unknown>
  timestamp_ms: number
  token_cost: number | null
  fiat_cost: number | null
  created_at: string
}

export interface ThoughtPayload {
  content: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  latency_ms: number
}

export interface ToolResultPayload {
  tool_name: string
  status: 'success' | 'failure' | 'retry'
  output_preview: string
  latency_ms: number
}

export interface LedgerPayload {
  amount: number
  balance_after: number
  type: string
  description: string
  external_ref?: string
}

export interface NeuronSpawnedPayload {
  neuron_id: string
  task: string
  parent_event_id: string
}

export interface SynapticIntegrationPayload {
  neuron_ids_merged: string[]
  failed_neurons: string[]
  synthesis: string
}

export interface AskHumanPayload {
  prompt: string
  screenshot_url: string | null
  timeout_seconds: number
  type: '2fa' | 'captcha' | 'general'
}

export interface ApprovalPayload {
  amount: number
  justification: string
  token_roi_estimate: string | null
}

export interface EntityPayload {
  entity_type: string
  entity_id: string
  data: Record<string, unknown>
  operation: 'CREATE' | 'UPDATE'
}
