<template>
  <PageContainer :key="route.path">
    <PageHeader title="發佈你的區塊鏈書" />

    <AuthRequiredView>
      <NuxtPage />
    </AuthRequiredView>
  </PageContainer>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
const route = useRoute()

useSeoMeta({
  title: $t('seo_titles.publish_nft_book'),
  ogTitle: $t('seo_titles.publish_nft_book')
})

</script>
