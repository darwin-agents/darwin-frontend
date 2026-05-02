import type { DarwinEvent } from './events'

export interface NeuronLane {
  neuron_id: string
  status: 'active' | 'completed' | 'failed'
  events: DarwinEvent[]
  spawn_timestamp_ms: number
  end_timestamp_ms: number | null
}

export interface CanvasLayout {
  genesis_timestamp_ms: number
  ms_per_px: number
  zoom: number
  total_width_px: number
  total_height_px: number
}

export interface TraceNode {
  node_id: string
  parent_node_id: string | null
  type: 'THOUGHT' | 'TOOL_CALL' | 'TOOL_RESULT' | 'LLM_INFERENCE'
  timestamp_ms: number
  content: string
  tool_name: string | null
  tool_input: Record<string, unknown> | null
  tool_output: Record<string, unknown> | null
  token_cost: number
  latency_ms: number
}
