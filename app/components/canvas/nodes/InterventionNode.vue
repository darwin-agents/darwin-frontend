<script setup lang="ts">
import { ShieldQuestion, User, ScanFace } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{
  event: DarwinEvent
  darwinId: string
}>()

const notifications = useNotificationStore()
const agent = useAgentStore()

const isPending = computed(() => notifications.pending.some((n) => n.id === props.event.id))

const isApproval = computed(() => props.event.event_type === 'APPROVAL_REQUESTED')

const accent = computed(() => {
  if (props.event.event_type === 'APPROVAL_DENIED') return '#ef4444'
  if (!isPending.value && String(props.event.event_type).includes('RESOLVED')) return '#22c55e'
  return '#f59e0b'
})

const label = computed(() => {
  if (props.event.event_type.includes('CAPTCHA')) return 'CAPTCHA'
  if (props.event.event_type.includes('APPROVAL')) return 'Approve'
  return 'Human'
})

async function onApprove(e: Event) {
  e.stopPropagation()
  await agent.patchConfig(props.darwinId, { requires_approval: false })
}

async function onDeny(ev: Event) {
  ev.stopPropagation()
  await agent.patchConfig(props.darwinId, { requires_approval: true })
}
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="accent" :label="label" :pulse="isPending" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <ShieldQuestion v-if="isApproval" class="text-amber-400" :size="14" style="display: block; margin: auto" />
      <ScanFace v-else-if="event.event_type.includes('CAPTCHA')" class="text-orange-400" :size="14" style="display: block; margin: auto" />
      <User v-else class="text-amber-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
    <foreignObject v-if="isApproval && isPending" x="24" y="-20" width="180" height="44">
      <div xmlns="http://www.w3.org/1999/xhtml" class="flex gap-1">
        <button
          type="button"
          class="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
          @click="onApprove"
        >
          ✓ Approve
        </button>
        <button
          type="button"
          class="px-2 py-1 text-xs bg-red-900/60 hover:bg-red-900 text-red-300 rounded transition-colors"
          @click="onDeny"
        >
          ✕ Deny
        </button>
      </div>
    </foreignObject>
  </g>
</template>
