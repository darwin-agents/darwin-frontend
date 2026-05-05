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

function closeConsole() {
  panels.closeAllPanels()
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && panels.showCommandConsole) closeConsole()
}

onMounted(() => window.addEventListener('keydown', onEscape))
onUnmounted(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <Transition name="fade-in">
    <div
      v-if="panels.showCommandConsole"
      class="fixed inset-0 z-40 bg-black/10"
      @pointerdown.stop.prevent="closeConsole"
      @click.stop.prevent
    />
  </Transition>
  <Transition name="slide-right">
    <aside
      v-if="panels.showCommandConsole"
      class="fixed right-0 top-0 h-screen w-full max-w-md bg-darwin-surface border-l border-darwin-border z-50 flex flex-col shadow-2xl"
      @click.stop
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-darwin-border shrink-0">
        <h2 class="text-sm font-semibold text-darwin-ink flex items-center gap-2">
          <Terminal :size="14" class="text-darwin-accent" />
          Command Console
        </h2>
        <button
          type="button"
          class="text-darwin-muted hover:text-darwin-ink p-1.5 rounded-md hover:bg-darwin-bg-3 transition-all"
          @pointerdown.stop.prevent="closeConsole"
          @click.stop.prevent
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
            :class="openSection === s.id ? 'text-darwin-ink bg-darwin-bg-3' : 'text-darwin-muted hover:text-darwin-ink-soft'"
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
            class="px-4 pb-4 pt-2 border-t border-darwin-border-soft"
          >
            <ConsoleCognitiveUplink v-if="s.id === 'uplink'" :darwin-id="darwinId" />
            <ConsoleSecretsVault v-if="s.id === 'vault'" :darwin-id="darwinId" />
            <ConsoleMetabolicInjection v-if="s.id === 'budget'" :darwin-id="darwinId" />
            <ConsoleAutonomyToggle v-if="s.id === 'auto'" :darwin-id="darwinId" />
          </div>
        </section>

        <ConsoleKillSwitch :darwin-id="darwinId" />
      </div>
    </aside>
  </Transition>
</template>
