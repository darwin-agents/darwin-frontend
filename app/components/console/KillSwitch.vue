<script setup lang="ts">
import { Skull, Loader2 } from 'lucide-vue-next'

const props = defineProps<{ darwinId: string }>()

const { t } = useI18n()
const agent = useAgentStore()
const toast = useToast()
const showKillConfirm = ref(false)
const terminating = ref(false)

async function confirmTerminate() {
  terminating.value = true
  try {
    await agent.terminate(props.darwinId)
  } catch {
    toast(t('console.kill.failed'), 'error')
  } finally {
    terminating.value = false
    showKillConfirm.value = false
  }
}
</script>

<template>
  <div class="pt-2">
    <button
      type="button"
      class="w-full py-2.5 rounded-lg text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-all flex items-center justify-center gap-2"
      :disabled="agent.isTerminated"
      @click="showKillConfirm = true"
    >
      <Skull :size="14" />
      {{ t('console.kill.button') }}
    </button>
    <UiDarwinModal v-model="showKillConfirm" :title="t('console.kill.button')">
      <p class="text-sm text-darwin-ink-soft leading-relaxed">
        {{ t('console.kill.confirm') }}
      </p>
      <template #footer>
        <button type="button" class="darwin-btn-ghost" @click="showKillConfirm = false">{{ t('console.kill.cancel') }}</button>
        <button type="button" class="darwin-btn-danger" :disabled="terminating" @click="confirmTerminate">
          <Loader2 v-if="terminating" :size="14" class="animate-spin" />
          {{ t('console.kill.terminate') }}
        </button>
      </template>
    </UiDarwinModal>
  </div>
</template>
