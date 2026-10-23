<script setup lang="ts">
definePageMeta({ layout: false })
const { t } = useI18n()
useHead({ title: () => t('resolve.pageTitle') })
</script>

<template>
  <MobileInterstitial />
</template>
