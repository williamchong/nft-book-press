<template>
  <nav>
    <ul>
      <li>
        <NuxtLink :to="{ name: 'mint-nft' }">
          Mint NFT
        </NuxtLink>
      </li>
      <li>
        <NuxtLink :to="{ name: 'nft-book-store' }">
          Manage NFT Books
        </NuxtLink>
      </li>
      <li>
        <a :href="toolsURL" target="_blank">
          More NFT tools
        </a>
      </li>
    </ul>
  </nav>
</template>
<script setup>
import { ISCN_TOOLS_URL } from '~/constant'

const toolsURL = ref(ISCN_TOOLS_URL)

</script>
