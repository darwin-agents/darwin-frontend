export function useCanvasPanels() {
  type CanvasPanel = 'console' | 'entity' | 'skills' | 'ledger' | 'assets'
  const activePanel = useState<CanvasPanel | null>('canvas-panels-active', () => null)

  // Wrap in reactive so nested computed refs unwrap in templates (`v-if="panels.showX"`).
  // A plain object would leave `panels.showX` as the ref object, always truthy.
  return reactive({
    activePanel,

    showCommandConsole: computed(() => activePanel.value === 'console'),
    showEntityPanel: computed(() => activePanel.value === 'entity'),
    showSkillsPanel: computed(() => activePanel.value === 'skills'),
    showLedgerPanel: computed(() => activePanel.value === 'ledger'),
    showAssetsPanel: computed(() => activePanel.value === 'assets'),

    closeAllPanels() {
      activePanel.value = null
    },

    toggleConsole() {
      activePanel.value = activePanel.value === 'console' ? null : 'console'
    },
    closeConsole() {
      activePanel.value = null
    },
    toggleEntityPanel() {
      activePanel.value = activePanel.value === 'entity' ? null : 'entity'
    },
    closeEntityPanel() {
      activePanel.value = null
    },
    toggleSkillsPanel() {
      activePanel.value = activePanel.value === 'skills' ? null : 'skills'
    },
    closeSkillsPanel() {
      activePanel.value = null
    },
    toggleLedgerPanel() {
      activePanel.value = activePanel.value === 'ledger' ? null : 'ledger'
    },
    closeLedgerPanel() {
      activePanel.value = null
    },
    toggleAssetsPanel() {
      activePanel.value = activePanel.value === 'assets' ? null : 'assets'
    },
    closeAssetsPanel() {
      activePanel.value = null
    },

    closeAllSidePanels() {
      if (activePanel.value !== 'console') activePanel.value = null
    },
  })
}
