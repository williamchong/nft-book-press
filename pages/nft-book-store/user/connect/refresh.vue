<template>
  <div>
    <h1 class="font-bold font-mono">Stripe Connect returned</h1>
    <UCard>
      Some unexpected issue happened, please go back to connect status page and try again

      <template #footer>
        <UButton
          label="Go back"
          :to="{ name: 'nft-book-store-user' }"
        />
      </template>
    </UCard>
  </div>
</template>
