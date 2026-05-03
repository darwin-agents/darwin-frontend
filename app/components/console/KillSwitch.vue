<script setup lang="ts">
import { Skull, Loader2 } from 'lucide-vue-next'

const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const showKillConfirm = ref(false)
const terminating = ref(false)

async function confirmTerminate() {
  terminating.value = true
  try {
    await agent.terminate(props.darwinId)
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
      class="w-full py-2.5 rounded-lg text-sm font-medium bg-red-500/[0.08] hover:bg-red-500/[0.15] text-red-400 border border-red-500/20 transition-all flex items-center justify-center gap-2"
      :disabled="agent.isTerminated"
      @click="showKillConfirm = true"
    >
      <Skull :size="14" />
      Terminate Agent
    </button>
    <DarwinModal v-model="showKillConfirm" title="Terminate Agent">
      <p class="text-sm text-slate-300 leading-relaxed">
        This is permanent. The container will be stopped, the VCC frozen,
        and the session archived. The agent cannot be revived.
      </p>
      <template #footer>
        <button type="button" class="darwin-btn-ghost" @click="showKillConfirm = false">Cancel</button>
        <button type="button" class="darwin-btn-danger" :disabled="terminating" @click="confirmTerminate">
          <Loader2 v-if="terminating" :size="14" class="animate-spin" />
          Terminate
        </button>
      </template>
    </DarwinModal>
  </div>
</template>
