export function useInterventionJWT() {
  const route = useRoute()

  const decoded = computed(() => {
    const token = route.query.token as string | undefined
    if (!token) return null
    try {
      // JWT segments are base64url; atob only accepts standard base64
      const segment = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(segment)) as {
        darwin_id: string
        session_id: string
        purpose: string
        exp: number
      }
      return payload
    } catch {
      return null
    }
  })

  const isExpired = computed(() => {
    if (!decoded.value) return true
    return Date.now() / 1000 > decoded.value.exp
  })

  return { decoded, isExpired }
}
