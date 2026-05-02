<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const uplinkMessage = ref('')

async function sendUplink() {
  if (!uplinkMessage.value.trim()) return
  await agent.postUplink(props.darwinId, uplinkMessage.value.trim())
  uplinkMessage.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <textarea
      v-model="uplinkMessage"
      placeholder="Inject a mid-lifecycle directive..."
      class="w-full text-sm bg-white/5 rounded p-2 text-slate-200 placeholder:text-slate-600 resize-none h-24 darwin-input border-0"
    />
    <button type="button" class="darwin-btn-primary w-full text-sm" @click="sendUplink">⚡ Inject Uplink</button>
  </div>
</template>
