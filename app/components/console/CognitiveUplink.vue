<script setup lang="ts">
import { Zap, Loader2 } from 'lucide-vue-next'

const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const uplinkMessage = ref('')
const sending = ref(false)

async function sendUplink() {
  const msg = uplinkMessage.value.trim()
  if (!msg) return
  sending.value = true
  try {
    await agent.postUplink(props.darwinId, msg)
    uplinkMessage.value = ''
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <textarea
      v-model="uplinkMessage"
      placeholder="Inject a mid-lifecycle directive... e.g. 'Pivot to aerospace momentum for 4 hours.'"
      class="darwin-input resize-none h-24"
    />
    <button
      type="button"
      class="darwin-btn-primary w-full text-sm"
      :disabled="!uplinkMessage.trim() || sending"
      @click="sendUplink"
    >
      <Loader2 v-if="sending" :size="14" class="animate-spin" />
      <Zap v-else :size="14" />
      Inject Uplink
    </button>
  </div>
</template>
