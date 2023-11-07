<template>
  <header class="shadow-md">
    <UContainer class="flex justify-between items-center gap-4 py-4">
      <h1>
        <UButton
          class="font-bold"
          variant="ghost"
          label="LikeCoin NFT Book Press"
          :to="{ name: 'index' }"
        />
      </h1>

      <div class="flex items-center gap-2">
        <WalletHeader />
        <ColorModeButton />
      </div>
    </UContainer>
  </header>
</template>
