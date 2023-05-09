<template>
  <div>
    <h1>NFT Book Store management page</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="!bookStoreApiStore.isAuthenticated">
      <h2>1. Authenticate</h2>
      <div>
        <button :disabled="isLoading" @click="onClickAuth">
          Authorize
        </button>
      </div>
    </section>
    <NuxtPage v-else />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWalletStore } from '~/stores/wallet'
import { useBookStoreApiStore } from '~/stores/book-store-api'

const walletStore = useWalletStore()
const bookStoreApiStore = useBookStoreApiStore()
const { wallet, signer } = storeToRefs(walletStore)
const { connect, signMessageMemo } = walletStore
const { authenticate } = bookStoreApiStore

const error = ref('')
const isLoading = ref(false)

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

async function onClickAuth () {
  try {
    isLoading.value = true
    if (!wallet.value || !signer.value) {
      await connect()
    }
    if (!wallet.value || !signer.value) { return }
    const signature = await signMessageMemo('authorize', ['read:nftbook', 'write:nftbook'])
    await authenticate(wallet.value, signature)
  } catch (err) {
    console.error(err)
    error.value = (err as Error).toString()
  } finally {
    isLoading.value = false
  }
}

</script>
