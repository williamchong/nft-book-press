<template>
  <div class="redirect-page">
    <div class="flex flex-col items-center my-48">
      <h1 class="text-24">
        Redirecting
      </h1>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const store = useWalletStore()
const { handleConnectorRedirect } = store

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const { method, code } = route.query
  if (method && code) {
    await handleConnectorRedirect({
      method: method as string,
      params: { code }
    })
    const postAuthRoute = '/'
    router.replace(postAuthRoute)
  }
})
</script>
