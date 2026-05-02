import type { EventType } from '~/types/events'

const FALLBACK = 'text-slate-400'

const MAP: Partial<Record<EventType, string>> = {
  AGENT_SPAWNED: 'text-indigo-400',
  THOUGHT: 'text-violet-400',
  TOOL_CALL: 'text-emerald-400',
  TOOL_RESULT: 'text-emerald-400',
  LEDGER_DEBIT: 'text-red-400',
  LEDGER_CREDIT: 'text-green-400',
  SKILL_CREATED: 'text-amber-400',
  SKILL_LOADED: 'text-amber-400',
  ENTITY_CREATED: 'text-cyan-400',
  ENTITY_UPDATED: 'text-cyan-400',
  EPISODIC_SUMMARY_WRITTEN: 'text-purple-400',
  ASK_HUMAN_SENT: 'text-amber-400',
  ASK_HUMAN_RESOLVED: 'text-green-400',
  APPROVAL_REQUESTED: 'text-amber-400',
  APPROVAL_GRANTED: 'text-green-400',
  APPROVAL_DENIED: 'text-red-400',
  CAPTCHA_DELEGATED: 'text-orange-400',
  NEURON_SPAWNED: 'text-sky-400',
  NEURON_COMPLETED: 'text-green-400',
  NEURON_FAILED: 'text-red-400',
  SYNAPTIC_INTEGRATION: 'text-indigo-400',
  AGENT_WOKE: 'text-green-400',
  AGENT_HIBERNATED: 'text-slate-400',
  AGENT_TERMINATED: 'text-red-400',
  BROWSER_SCREENSHOT: 'text-sky-400',
}

export function eventColorClass(eventType: EventType): string {
  return MAP[eventType] ?? FALLBACK
}

/** Hex / border accent for SVG nodes */
export function eventAccentColor(eventType: EventType): string {
  const hex: Partial<Record<string, string>> = {
    AGENT_SPAWNED: '#6366f1',
    THOUGHT: '#8b5cf6',
    TOOL_CALL: '#22c55e',
    TOOL_RESULT: '#22c55e',
    LEDGER_DEBIT: '#ef4444',
    LEDGER_CREDIT: '#22c55e',
    ASK_HUMAN_SENT: '#f59e0b',
    APPROVAL_REQUESTED: '#f59e0b',
    AGENT_HIBERNATED: '#64748b',
    AGENT_TERMINATED: '#ef4444',
    SYNAPTIC_INTEGRATION: '#6366f1',
  }
  return hex[eventType] ?? '#94a3b8'
}
