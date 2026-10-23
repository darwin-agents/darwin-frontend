<script setup lang="ts">
// Title template lives here: functions in nuxt.config `app.head` aren't serialized.
useHead({ titleTemplate: (title) => (title ? `${title} · Darwin Agents` : 'Darwin Agents') })
// lang/dir, canonical, og:url, og:locale and hreflang alternates for the current language.
const i18nHead = useLocaleHead()
useHead(() => ({ htmlAttrs: i18nHead.value.htmlAttrs, link: i18nHead.value.link, meta: i18nHead.value.meta }))
</script>

<template>
  <NuxtPage />
  <UiDarwinToast />
</template>
