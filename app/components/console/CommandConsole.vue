<script setup lang="ts">
import { X, ChevronDown, Terminal } from 'lucide-vue-next'

const props = defineProps<{ darwinId: string }>()

const panels = useCanvasPanels()
const openSection = ref<string | null>('uplink')

const sections = [
  { id: 'uplink', label: 'Cognitive Uplink' },
  { id: 'vault', label: 'Secrets Vault' },
  { id: 'budget', label: 'Metabolic Injection' },
  { id: 'auto', label: 'Autonomy' },
]

function toggle(id: string) {
  openSection.value = openSection.value === id ? null : id
}
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="panels.showCommandConsole"
      class="fixed right-0 top-0 h-screen w-full max-w-md bg-darwin-surface border-l border-white/[0.06] z-40 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal :size="14" class="text-violet-400" />
          Command Console
        </h2>
        <button
          type="button"
          class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all"
          @click="panels.closeConsole()"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <section
          v-for="s in sections"
          :key="s.id"
          class="darwin-card overflow-hidden"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors"
            :class="openSection === s.id ? 'text-white bg-white/[0.04]' : 'text-slate-400 hover:text-slate-300'"
            @click="toggle(s.id)"
          >
            {{ s.label }}
            <ChevronDown
              :size="14"
              class="transition-transform"
              :class="openSection === s.id ? 'rotate-180' : ''"
            />
          </button>
          <div
            v-if="openSection === s.id"
            class="px-4 pb-4 pt-2 border-t border-white/[0.04]"
          >
            <CognitiveUplink v-if="s.id === 'uplink'" :darwin-id="darwinId" />
            <SecretsVault v-if="s.id === 'vault'" :darwin-id="darwinId" />
            <MetabolicInjection v-if="s.id === 'budget'" :darwin-id="darwinId" />
            <AutonomyToggle v-if="s.id === 'auto'" :darwin-id="darwinId" />
          </div>
        </section>

        <KillSwitch :darwin-id="darwinId" />
      </div>
    </div>
  </Transition>
</template>
