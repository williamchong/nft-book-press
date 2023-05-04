<template>
  <div>
    <h1>NFT Book Listing</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="bookStoreApiStore.isAuthenticated">
      <h2>Current listing</h2>
      <ul>
        <li v-for="b in bookList" :key="b.classId">
          {{ b.classId }} | {{ b.price }} | {{ b.stock }} | {{ `https://api.rinkeby.like.co/likernft/book/purchase/${b.classId}/new` }}
        </li>
      </ul>
      <NuxtLink :to="{ name: 'nft-book-store-new' }">New Listing</NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { useWalletStore } from '~/stores/wallet'
import { LIKE_CO_API } from '~/constant'

const walletStore = useWalletStore()
const bookStoreApiStore = useBookStoreApiStore()
const { wallet } = storeToRefs(walletStore)

const error = ref('')
const isLoading = ref(false)
const bookList = ref<any[]>([])

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  const { data } = await useFetch(`${LIKE_CO_API}/likernft/book/store/list?wallet=${wallet.value}`)
  if (!data?.value) { throw new Error('INVALID_ISCN_ID') }
  bookList.value = (data.value as any)?.list
})

</script>
