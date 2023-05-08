<template>
  <div>
    <h1>NFT Book Status {{ classId }}</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="bookStoreApiStore.isAuthenticated">
      <div>
        {{ `https://api.${IS_TESTNET ? 'rinkeby.' : ''}like.co/likernft/book/purchase/${classId}/new` }}
      </div>
      <tr v-for="p in purchaseList" :key="p.classId">
        <td>{{ p.email }}</td>
        <td>{{ p.status }}</td>
        <td>{{ p.wallet }}</td>
        <td>{{ p.message }}</td>
        <td>{{ p.from }}</td>
        <td>
          <NuxtLink
            v-if="p.status === 'pendingNFT'"
            :to="{
              name: 'nft-book-store-send-classId',
              params: {
                classId: p.classId
              },
              query: {
                payment_id: p.id
              }
            }"
          >
            Send NFT
          </NuxtLink>
          <a v-else-if="p.status === 'completed'" :href="`${chainExplorerURL}/${p.txHash}`" target="_blank">
            View Transaction
          </a>
          <span v-else>
            -
          </span>
        </td>
      </tr>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { CHAIN_EXPLORER_URL, LIKE_CO_API } from '~/constant'
import { useBookStoreApiStore } from '~/stores/book-store-api'

const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const route = useRoute()

const error = ref('')
const isLoading = ref(false)
const classId = ref(route.params.classId)
const purchaseList = ref<any[]>([])
const chainExplorerURL = ref(CHAIN_EXPLORER_URL)

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  const { data, error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/orders`,
    {
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
  if (fetchError.value) {
    if (fetchError.value.statusCode === 403) {
      error.value = 'NOT_OWNER_OF_NFT_CLASS'
    } else {
      error.value = fetchError.value.toString()
    }
  }
  purchaseList.value = (data.value as any).orders
})

</script>
