<template>
  <div>
    <h1>New NFT Book Listing</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="bookStoreApiStore.isAuthenticated">
      <p><label>NFT Class ID:</label></p>
      <input v-model="classIdInput" placeholder="likenft....">
      <p><label>Price(USD) per NFT Book</label></p>
      <input v-model="priceInput" type="number" placeholder="39">
      <p><label>Total number of NFT for sale</label></p>
      <input v-model="stockInput" type="number" placeholder="1000">
      <button :disabled="isLoading" @click="onSubmit">
        Submit
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useBookStoreApiStore } from '~/stores/book-store-api'

const bookStoreApiStore = useBookStoreApiStore()
const { newBookListing } = bookStoreApiStore
const router = useRouter()
const route = useRoute()

const error = ref('')
const isLoading = ref(false)

const classIdInput = ref(route.query.class_id as string || '')
const priceInput = ref(0)
const stockInput = ref(Number(route.query.count as string || 0))

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

async function onSubmit () {
  try {
    isLoading.value = true
    await newBookListing(classIdInput.value, {
      priceInDecimal: Number(priceInput.value) * 100,
      stock: stockInput.value
    })
    router.push({ name: 'nft-book-store' })
  } catch (err) {
    console.error(err)
    error.value = (err as Error).toString()
  } finally {
    isLoading.value = false
  }
}

</script>
