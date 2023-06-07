<template>
  <div>
    <header>
      <div style="display: flex; flex-wrap:wrap; background-color:#28646e; color: white; padding: 20px;">
        <NuxtLink :to="{ name: 'index' }">
          <h1>LikeCoin NFT Book Press</h1>
        </NuxtLink>
        <div style="flex: 1" />
        <WalletHeader />
      </div>
    </header>
    <div class="wrapper">
      <div style="margin: 10px">
        <slot />
      </div>
    </div>
  </div>
</template>
