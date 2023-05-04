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
      <tr v-for="p in purchaseList" :key="p.classId">
        <td>{{ p.id }}</td>
        <td>{{ p.email }}</td>
        <td>{{ p.status }}</td>
        <td>{{ p.wallet }}</td>
        <td>Send / Tx</td>
      </tr>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { LIKE_CO_API } from '~/constant'
import { useBookStoreApiStore } from '~/stores/book-store-api'

const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const route = useRoute()

const error = ref('')
const isLoading = ref(false)
const classId = ref(route.params.classId)
const purchaseList = ref<any[]>([])

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  const { data } = await useFetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/orders`,
    {
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
  if (!data?.value) { throw new Error('INVALID_ISCN_ID') }
  purchaseList.value = (data.value as any).orders
})

</script>
