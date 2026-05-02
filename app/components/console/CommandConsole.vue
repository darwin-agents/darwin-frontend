<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const panels = useCanvasPanels()
const openSection = ref<string | null>('uplink')
</script>

<template>
  <div
    v-if="panels.showCommandConsole"
    class="fixed right-0 top-0 h-screen w-full max-w-md bg-darwin-surface border-l border-white/10 z-40 flex flex-col shadow-2xl"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h2 class="text-sm font-semibold text-white">Command Console</h2>
      <button type="button" class="text-slate-400 hover:text-white text-sm" @click="panels.closeConsole()">
        Close
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <section class="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-400 bg-white/5"
          @click="openSection = openSection === 'uplink' ? null : 'uplink'"
        >
          Cognitive Uplink
        </button>
        <div v-if="openSection === 'uplink'" class="p-3 border-t border-white/5">
          <CognitiveUplink :darwin-id="darwinId" />
        </div>
      </section>
      <section class="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-400 bg-white/5"
          @click="openSection = openSection === 'vault' ? null : 'vault'"
        >
          Secrets Vault
        </button>
        <div v-if="openSection === 'vault'" class="p-3 border-t border-white/5">
          <SecretsVault :darwin-id="darwinId" />
        </div>
      </section>
      <section class="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-400 bg-white/5"
          @click="openSection = openSection === 'budget' ? null : 'budget'"
        >
          Metabolic Injection
        </button>
        <div v-if="openSection === 'budget'" class="p-3 border-t border-white/5">
          <MetabolicInjection :darwin-id="darwinId" />
        </div>
      </section>
      <section class="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-400 bg-white/5"
          @click="openSection = openSection === 'auto' ? null : 'auto'"
        >
          Autonomy
        </button>
        <div v-if="openSection === 'auto'" class="p-3 border-t border-white/5">
          <AutonomyToggle :darwin-id="darwinId" />
        </div>
      </section>
      <KillSwitch :darwin-id="darwinId" />
    </div>
  </div>
</template>
