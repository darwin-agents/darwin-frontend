import { proxyRequest } from 'h3'
import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const url = getRequestURL(event)
  const prefix = '/api/v1/'
  const rest = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : ''
  const target = joinURL(config.backendUrl.replace(/\/$/, ''), 'api', 'v1', rest) + url.search

  return proxyRequest(event, target, { fetch: globalThis.fetch })
})
