export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const publicPaths = new Set(['/', '/login', '/resolve'])
  if (publicPaths.has(to.path)) return
  if (!user.value) return navigateTo('/login')
})
