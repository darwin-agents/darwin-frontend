<script setup lang="ts">
import { Brain } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{ event: DarwinEvent }>()

const model = computed(() => (props.event.payload.model as string) ?? '')

const shortModel = computed(() => {
  const m = model.value
  if (m.includes('opus'))    return 'opus'
  if (m.includes('sonnet'))  return 'sonnet'
  if (m.includes('haiku'))   return 'haiku'
  if (m.includes('4o-mini')) return 'gpt-4o-mini'
  if (m.includes('4o'))      return 'gpt-4o'
  return m.split('-')[0] || ''
})

const modelClass = computed(() => {
  switch (shortModel.value) {
    case 'opus':      return 'model-tag--opus'
    case 'sonnet':    return 'model-tag--sonnet'
    case 'haiku':     return 'model-tag--haiku'
    case 'gpt-4o':    return 'model-tag--gpt4o'
    case 'gpt-4o-mini': return 'model-tag--gpt4omini'
    default:          return 'model-tag--unknown'
  }
})
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#8b5cf6" label="Thought" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Brain class="text-violet-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
    <foreignObject v-if="shortModel" x="-28" y="22" width="56" height="16">
      <span :class="['model-tag', modelClass]">{{ shortModel }}</span>
    </foreignObject>
  </g>
</template>

<style scoped>
.model-tag {
  display: inline-block;
  width: 100%;
  text-align: center;
  font-size: 8px;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 3px;
  padding: 1px 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.model-tag--opus     { background: #E6F1FB; color: #185FA5; border: 1px solid #185FA5; }
.model-tag--sonnet   { background: #EEEDFE; color: #534AB7; border: 1px solid #534AB7; }
.model-tag--haiku    { background: #EAF3DE; color: #3B6D11; border: 1px solid #3B6D11; }
.model-tag--gpt4o    { background: #E1F5EE; color: #0F6E56; border: 1px solid #0F6E56; }
.model-tag--gpt4omini{ background: #FAEEDA; color: #854F0B; border: 1px solid #854F0B; }
.model-tag--unknown  { background: #1f2937; color: #9ca3af; border: 1px solid #374151; }
</style>
