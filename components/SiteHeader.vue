<template>
  <header class="shadow-md">
    <UContainer class="flex justify-between items-center gap-4 py-4">
      <h1 class="flex items-center">
        <UButton
          class="font-bold"
          variant="ghost"
          label="LikeCoin NFT Book Press"
          :to="{ name: 'index' }"
        />
        <UBadge
          v-if="IS_TESTNET"
          label="TESTNET"
          variant="subtle"
          color="amber"
          size="xs"
          :ui="{ rounded: 'rounded-full', font: 'font-mono' }"
        />
      </h1>

      <div class="flex items-center gap-2">
        <WalletHeader />
        <ColorModeButton />
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
import { IS_TESTNET } from '~/constant'
</script>
