<template>
  <div class="min-h-screen bg-darwin-bg flex flex-col">
    <header class="border-b border-white/10 px-8 py-6 flex items-center justify-between">
      <NuxtLink to="/" class="text-lg font-semibold text-white tracking-tight">Darwin</NuxtLink>
      <nav class="flex gap-4 text-sm">
        <NuxtLink class="text-slate-400 hover:text-white transition-colors" to="/login">Sign in</NuxtLink>
        <NuxtLink class="darwin-btn-primary text-sm py-2" to="/login">Launch console</NuxtLink>
      </nav>
    </header>
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto">
      <h1 class="text-4xl font-semibold text-white mb-4">One agent. Full transparency.</h1>
      <p class="text-slate-400 text-lg mb-10">
        Real-time canvas, metabolic budgets, and human-in-the-loop control — without polling.
      </p>
      <NuxtLink to="/login" class="darwin-btn-primary inline-flex px-8 py-3 text-base">Get started</NuxtLink>
    </main>
  </div>
</template>
