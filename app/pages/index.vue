<script setup lang="ts">
import { Dna, Eye, Wallet, Shield, Zap, GitBranch } from 'lucide-vue-next'

const features = [
  {
    icon: Eye,
    title: 'Infinite Canvas',
    desc: 'Every thought, tool call, and financial event rendered as a real-time zoomable timeline. Zero polling.',
  },
  {
    icon: Wallet,
    title: 'Metabolic Budgets',
    desc: 'Hard-capped spend via virtual credit cards. Budget gauges update live as the agent burns compute.',
  },
  {
    icon: Shield,
    title: 'Human-in-the-Loop',
    desc: 'Approval gates, 2FA relay, CAPTCHA delegation — you stay in control without babysitting.',
  },
  {
    icon: GitBranch,
    title: 'Neural Threading',
    desc: 'Watch sub-agents branch, execute, and merge back into the trunk with full trace visibility.',
  },
  {
    icon: Zap,
    title: 'Cognitive Uplink',
    desc: 'Inject mid-lifecycle directives. Pivot the agent's strategy without restarting the session.',
  },
  {
    icon: Dna,
    title: 'Full Lineage',
    desc: 'From genesis to termination — every decision, every dollar, every skill created. Auditable.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <!-- Gradient background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/[0.07] rounded-full blur-[120px]" />
      <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[100px]" />
    </div>

    <!-- Navigation -->
    <header class="relative z-10 border-b border-white/[0.06]">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Dna :size="16" class="text-white" />
          </div>
          <span class="text-lg font-semibold text-white tracking-tight">Darwin</span>
        </NuxtLink>
        <nav class="flex items-center gap-3">
          <NuxtLink to="/login" class="darwin-btn-ghost text-sm py-2">Sign in</NuxtLink>
          <NuxtLink to="/login" class="darwin-btn-primary text-sm py-2">Launch console</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <main class="relative z-10">
      <section class="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.08] text-violet-300 text-xs font-medium mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Phase 1 — Single agent control surface
        </div>
        <h1 class="text-5xl sm:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
          One agent.<br />
          <span class="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Full transparency.</span>
        </h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Real-time canvas visualization, metabolic budget controls, and human-in-the-loop
          intervention — everything your autonomous agent does, rendered live. No polling.
        </p>
        <div class="flex items-center justify-center gap-4">
          <NuxtLink to="/login" class="darwin-btn-primary px-8 py-3 text-base">
            Get started
          </NuxtLink>
          <NuxtLink to="/login" class="darwin-btn-secondary px-8 py-3 text-base">
            View demo
          </NuxtLink>
        </div>
      </section>

      <!-- Canvas preview mockup -->
      <section class="max-w-5xl mx-auto px-6 pb-16">
        <div class="darwin-card p-1">
          <div class="rounded-lg bg-darwin-bg/60 border border-white/[0.04] p-6 min-h-[280px] flex items-center justify-center">
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-violet-500/40 border border-violet-500/60" />
                <div class="w-24 h-0.5 bg-violet-500/30" />
                <div class="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/60" />
                <div class="w-16 h-0.5 bg-violet-500/30" />
                <div class="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/60" />
                <div class="w-20 h-0.5 bg-violet-500/30" />
                <div class="w-3 h-3 rounded-full bg-sky-500/40 border border-sky-500/60" />
                <div class="w-12 h-0.5 bg-violet-500/30" />
                <div class="w-3 h-3 rounded-full bg-violet-500/40 border border-violet-500/60" />
              </div>
              <p class="text-xs text-slate-600">Live agent timeline → thoughts, tool calls, financial events</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="max-w-5xl mx-auto px-6 pb-32">
        <h2 class="text-2xl font-semibold text-white text-center mb-12">
          Everything the agent does, <span class="text-violet-400">visible</span>.
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="f in features"
            :key="f.title"
            class="darwin-card p-5 group hover:border-white/[0.12] transition-colors"
          >
            <div class="w-10 h-10 rounded-lg bg-violet-500/[0.08] border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/[0.12] transition-colors">
              <component :is="f.icon" :size="18" class="text-violet-400" />
            </div>
            <h3 class="text-sm font-semibold text-white mb-1.5">{{ f.title }}</h3>
            <p class="text-xs text-slate-500 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/[0.06] py-8">
      <div class="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-600">
        <span>Darwin Agents</span>
        <span>Phase 1 MVP</span>
      </div>
    </footer>
  </div>
</template>
