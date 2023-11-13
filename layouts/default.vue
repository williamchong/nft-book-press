<template>
  <UContainer class="flex flex-row gap-4">
    <SideNavBar class="py-4 max-w-[220px]" />
    <UContainer class="w-full py-4">
      <slot />
    </UContainer>
  </UContainer>
</template>
