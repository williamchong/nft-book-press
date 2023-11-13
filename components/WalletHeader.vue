<template>
  <div class="flex flex-wrap items-center gap-2">
    <template v-if="wallet">
      <UButton
        class="text-xs font-mono"
        :label="wallet"
        :to="portfolioURL"
        variant="soft"
        target="_blank"
      />
      <UButton
        label="Disconnect Wallet"
        icon="i-heroicons-arrow-left-on-rectangle"
        color="primary"
        variant="outline"
        @click="onClickDisconnect"
      />
    </template>
    <UButton
      v-else
      label="Connect Wallet"
      icon="i-heroicons-arrow-right-on-rectangle"
      color="primary"
      @click="connect"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWalletStore } from '~/stores/wallet'
import { getPortfolioURL } from '~/utils'

const store = useWalletStore()
const { wallet } = storeToRefs(store)
const { connect, disconnect } = store

const portfolioURL = computed(() => getPortfolioURL(wallet.value))

function onClickDisconnect () {
  disconnect()
  window.sessionStorage.removeItem('likecoin_nft_book_press_token')
}
</script>
