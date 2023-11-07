<template>
  <div class="flex items-center gap-4">
    <template v-if="wallet">
      <span>{{ wallet }}</span>
      <UButton
        label="Disconnect Wallet"
        color="primary"
        variant="outline"
        @click="onClickDisconnect"
      />
    </template>
    <UButton
      v-if="!wallet"
      label="Connect Wallet"
      color="primary"
      @click="connect"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWalletStore } from '~/stores/wallet'

const store = useWalletStore()
const { wallet } = storeToRefs(store)
const { connect, disconnect } = store

function onClickDisconnect () {
  disconnect()
  window.sessionStorage.removeItem('likecoin_nft_book_press_token')
}
</script>
