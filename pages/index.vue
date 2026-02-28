<template>
  <PageContainer>
    <PageHeader />

    <PageBody class="space-y-8">
      <h2 class="lg:mt-10 text-3xl font-bold">
        {{ $t('welcome.title') }}
      </h2>

      <SiteMenu :is-large="true" />
    </PageBody>
  </PageContainer>
</template>
<script setup lang="ts">
const { t: $t } = useI18n()
const localeRoute = useLocaleRoute()
const bookstoreApiStore = useBookstoreApiStore()

onMounted(async () => {
  if (bookstoreApiStore.isAuthenticated) {
    await navigateTo(localeRoute({ name: 'my-books' }), { replace: true })
  }
})
</script>
