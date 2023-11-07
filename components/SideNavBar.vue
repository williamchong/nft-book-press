<template>
  <UVerticalNavigation :links="links" />
</template>

<script setup>
import { ISCN_TOOLS_URL } from '~/constant'

const links = [
  {
    label: 'Mint NFT',
    icon: 'i-heroicons-sparkles',
    to: { name: 'mint-nft' }
  },
  {
    label: 'NFT Book Press',
    icon: 'i-heroicons-shopping-bag',
    to: { name: 'nft-book-store' }
  },
  {
    label: 'Manage NFT Books',
    icon: 'i-heroicons-rectangle-stack',
    to: { name: 'nft-book-store' }
  },
  {
    label: 'Manage Stripe Account',
    icon: 'i-heroicons-user-group',
    to: { name: 'nft-book-store-user' }
  },
  {
    label: 'NFT Authz Grants',
    icon: 'i-heroicons-user-plus',
    to: { name: 'authz' }
  },
  {
    label: 'More NFT Tools',
    icon: 'i-heroicons-arrow-top-right-on-square',
    to: ISCN_TOOLS_URL,
    target: '_blank'
  }
]
</script>
