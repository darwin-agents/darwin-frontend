<script setup lang="ts">
import { ShieldQuestion, User, ScanFace } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{
  event: DarwinEvent
  darwinId: string
}>()

const notifications = useNotificationStore()
const { approve, deny } = useApprovalFlow(() => props.darwinId)
const toast = useToast()

const isPending = computed(() => notifications.pending.some((n) => n.id === props.event.id))

const isApproval = computed(() => props.event.event_type === 'APPROVAL_REQUESTED')

const accent = computed(() => {
  if (props.event.event_type === 'APPROVAL_DENIED') return '#b42318'
  if (!isPending.value && /RESOLVED|GRANTED|SOLVED/.test(props.event.event_type)) return '#2f6f4e'
  return '#b45309'
})

const label = computed(() => {
  if (props.event.event_type.includes('CAPTCHA')) return 'CAPTCHA'
  if (props.event.event_type.includes('APPROVAL')) return 'Approve'
  return 'Human'
})

async function respond(e: Event, action: typeof approve) {
  e.stopPropagation()
  try {
    await action(props.event)
  } catch {
    toast('Could not send your decision. Please try again.', 'error')
  }
}
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="accent" :label="label" :pulse="isPending" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <ShieldQuestion v-if="isApproval" :size="14" style="display: block; margin: auto; color: #92400e" />
      <ScanFace v-else-if="event.event_type.includes('CAPTCHA')" :size="14" style="display: block; margin: auto; color: #c2410c" />
      <User v-else :size="14" style="display: block; margin: auto; color: #92400e" />
    </foreignObject>
    <foreignObject v-if="isApproval && isPending" x="24" y="-20" width="180" height="44">
      <div xmlns="http://www.w3.org/1999/xhtml" class="flex gap-1">
        <button
          type="button"
          class="px-2 py-1 text-[10px] font-medium rounded-lg bg-darwin-accent text-darwin-bg hover:bg-darwin-accent-deep transition-colors shadow-sm"
          @click="respond($event, approve)"
        >
          ✓ Approve
        </button>
        <button
          type="button"
          class="px-2 py-1 text-[10px] font-medium rounded-lg bg-darwin-bg-2 text-darwin-ink border border-darwin-border hover:bg-darwin-bg-3 transition-colors"
          @click="respond($event, deny)"
        >
          ✕ Deny
        </button>
      </div>
    </foreignObject>
  </g>
</template>
