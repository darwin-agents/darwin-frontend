export function useCanvasPanels() {
  const showCommandConsole = useState('canvas-panels-console', () => false)
  const showEntityPanel = useState('canvas-panels-entity', () => false)
  const showSkillsPanel = useState('canvas-panels-skills', () => false)
  const showLedgerPanel = useState('canvas-panels-ledger', () => false)
  const showAssetsPanel = useState('canvas-panels-assets', () => false)

  function toggleConsole() { showCommandConsole.value = !showCommandConsole.value }
  function closeConsole() { showCommandConsole.value = false }
  function toggleEntityPanel() { showEntityPanel.value = !showEntityPanel.value }
  function closeEntityPanel() { showEntityPanel.value = false }
  function toggleSkillsPanel() { showSkillsPanel.value = !showSkillsPanel.value }
  function closeSkillsPanel() { showSkillsPanel.value = false }
  function toggleLedgerPanel() { showLedgerPanel.value = !showLedgerPanel.value }
  function closeLedgerPanel() { showLedgerPanel.value = false }
  function toggleAssetsPanel() { showAssetsPanel.value = !showAssetsPanel.value }
  function closeAssetsPanel() { showAssetsPanel.value = false }

  function closeAllSidePanels() {
    showEntityPanel.value = false
    showSkillsPanel.value = false
    showLedgerPanel.value = false
    showAssetsPanel.value = false
  }

  return {
    showCommandConsole,
    showEntityPanel,
    showSkillsPanel,
    showLedgerPanel,
    showAssetsPanel,
    toggleConsole,
    closeConsole,
    toggleEntityPanel,
    closeEntityPanel,
    toggleSkillsPanel,
    closeSkillsPanel,
    toggleLedgerPanel,
    closeLedgerPanel,
    toggleAssetsPanel,
    closeAssetsPanel,
    closeAllSidePanels,
  }
}
