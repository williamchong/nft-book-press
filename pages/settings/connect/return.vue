<template>
  <UModal :open="true">
    <template #header>
      A unexpected issue happened
    </template>

    <template #body>
      Please go back to Stripe Connect status page and try again.
    </template>

    <template #footer>
      <UButton
        :label="$t('common.go_back')"
        :to="localeRoute({ name: 'settings' })"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const localeRoute = useLocaleRoute()
definePageMeta({ layout: 'page' })
</script>
