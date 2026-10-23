export interface Toast {
  id: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
}

/** Push a toast into the queue rendered by <UiDarwinToast /> in app.vue. */
export function useToast() {
  const toasts = useState<Toast[]>('darwin-toasts', () => [])
  return (message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID()
    toasts.value = [...toasts.value, { id, message, type }]
    setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 5000)
  }
}
