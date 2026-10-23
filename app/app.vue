<script setup lang="ts">
const route = useRoute()
const site = useRuntimeConfig().public.siteUrl
// Title template lives here: functions in nuxt.config `app.head` aren't serialized.
useHead({
  titleTemplate: (title) => (title ? `${title} · Darwin Agents` : 'Darwin Agents'),
  link: [{ rel: 'canonical', href: () => site + route.path }],
})
useSeoMeta({ ogUrl: () => site + route.path })
</script>

<template>
  <NuxtPage />
  <UiDarwinToast />
</template>
