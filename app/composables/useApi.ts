export function useApi() {
  const auth = useAuthStore()

  function headers(): Record<string, string> {
    const h: Record<string, string> = {}
    const tok = auth.accessToken
    if (tok) h.Authorization = `Bearer ${tok}`
    return h
  }

  async function get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const q = query
      ? Object.fromEntries(
          Object.entries(query).filter(
            ([, v]) => v !== undefined && v !== null && String(v) !== '',
          ) as [string, string | number][],
        )
      : undefined
    return $fetch<T>(`/api/v1${path}`, { headers: headers(), query: q })
  }

  async function post<T>(path: string, body?: object): Promise<T> {
    return $fetch<T>(`/api/v1${path}`, { method: 'POST', headers: headers(), body })
  }

  async function patch<T>(path: string, body: object): Promise<T> {
    return $fetch<T>(`/api/v1${path}`, { method: 'PATCH', headers: headers(), body })
  }

  return { headers, get, post, patch }
}
