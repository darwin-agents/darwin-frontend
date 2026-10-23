<script setup lang="ts">
const route = useRoute()
const site = useRuntimeConfig().public.siteUrl
useHead({ link: [{ rel: 'canonical', href: () => site + route.path }] })
useSeoMeta({ ogUrl: () => site + route.path })
</script>

<template>
  <NuxtPage />
  <UiDarwinToast />
</template>
