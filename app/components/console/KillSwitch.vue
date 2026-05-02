<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const showKillConfirm = ref(false)

async function confirmTerminate() {
  await agent.terminate(props.darwinId)
  showKillConfirm.value = false
}
</script>

<template>
  <div>
    <button
      type="button"
      class="w-full py-2 rounded text-sm font-semibold bg-red-900/40 hover:bg-red-900/70 text-red-400 border border-red-900 transition-colors"
      @click="showKillConfirm = true"
    >
      ☠ Terminate Agent
    </button>
    <DarwinModal v-model="showKillConfirm" title="Terminate Agent">
      <p class="text-sm text-slate-300">
        This stops the agent and archives its session. This cannot be undone from the canvas.
      </p>
      <template #footer>
        <button type="button" class="darwin-btn-ghost" @click="showKillConfirm = false">Cancel</button>
        <button type="button" class="darwin-btn-danger" @click="confirmTerminate">Terminate</button>
      </template>
    </DarwinModal>
  </div>
</template>
