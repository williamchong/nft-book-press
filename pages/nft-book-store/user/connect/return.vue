<template>
  <div>
    <h1 class="font-bold font-mono">Stripe Connect status</h1>

    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      :title="`${error}`"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link', padded: false }"
      @close="error = ''"
    />

    <UProgress v-if="isLoading" animation="carousel">
      <template #indicator>
        Loading...
      </template>
    </UProgress>

    <section v-if="bookStoreApiStore.isAuthenticated">
      <h2>Refreshing Stripe Connect account status</h2>
      <div>
        <p>Refreshing...</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { LIKE_CO_API } from '~/constant'

const router = useRouter()
const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const error = ref('')
const isLoading = ref(false)
const isDone = ref(false)

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  try {
    isLoading.value = true
    const { data, error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/user/connect/refresh`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    )
    if (fetchError.value) {
      throw new Error(fetchError.value.toString())
    }
    isDone.value = data.isReady
    router.push({ name: 'nft-book-store-user' })
  } catch (e) {
    console.error(e)
    error.value = e.toString()
  } finally {
    isLoading.value = false
  }
})
</script>
