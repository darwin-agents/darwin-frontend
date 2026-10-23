<script setup lang="ts">
import { Zap, Loader2 } from 'lucide-vue-next'

const props = defineProps<{ darwinId: string }>()

const { t } = useI18n()
const agent = useAgentStore()
const toast = useToast()
const uplinkMessage = ref('')
const sending = ref(false)

async function sendUplink() {
  const msg = uplinkMessage.value.trim()
  if (!msg) return
  sending.value = true
  try {
    await agent.postUplink(props.darwinId, msg)
    uplinkMessage.value = ''
    toast(t('console.uplink.sent'), 'success')
  } catch {
    toast(t('console.uplink.failed'), 'error')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <textarea
      v-model="uplinkMessage"
      :placeholder="t('console.uplink.placeholder')"
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
      {{ t('console.uplink.submit') }}
    </button>
  </div>
</template>
