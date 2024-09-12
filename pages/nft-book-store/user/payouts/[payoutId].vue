<template>
  <PageBody class="space-y-10 pb-10">
    <div class="flex justify-between gap-4">
      <h1 class="text-lg font-bold font-mono flex-wrap">
        Payout Details - {{ payoutId }}
      </h1>
    </div>

    <UProgress v-if="isLoading" animation="carousel">
      <template #indicator>
        Loading...
      </template>
    </UProgress>

    <UCard
      v-if="bookStoreApiStore.isAuthenticated"
      :ui="{ footer: { base: 'space-y-4' } }"
    >
      <template #header>
        <h3 class="font-bold font-mono">
          Payout Information
        </h3>
      </template>

      <UTable
        :columns="[
          { key: 'id', label: 'ID' },
          { key: 'createdTs', label: 'Created' },
          { key: 'currency', label: 'currency' },
          { key: 'amount', label: 'Payout Amount' },
          { key: 'status', label: 'Status' },
          { key: 'arrivalTs', label: 'Arrived' },
        ]"
        :rows="payoutDataRows"
        :ui="{ th: { base: 'text-center' }, td: { base: 'text-center' } }"
      />
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-sm font-bold font-mono">
          Payout Commission Item Details
        </h3>
      </template>
      <UTable
        :columns="[
          { key: 'commissionId', label: 'Commission ID' },
          { key: 'createdTs', label: 'Created' },
          { key: 'currency', label: 'Currency' },
          { key: 'amount', label: 'Commission Amount' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status' },
          { key: 'metadata', label: 'Metadata' },
        ]"
        :rows="payoutItemRows"
        :ui="{ th: { base: 'text-center' }, td: { base: 'text-center' } }"
      />
    </UCard>
  </PageBody>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBookStoreApiStore } from '~/stores/book-store-api'

const { LIKE_CO_API } = useRuntimeConfig().public
const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const route = useRoute()
const payoutData = ref<any>({})
const payoutItemDetails = ref<any>([])

const error = ref('')
const isLoading = ref(false)
const payoutId = ref(route.params.payoutId as string)

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

const payoutDataRows = computed(() => {
  if (!payoutData.value) { return [] }
  const {
    id,
    createdTs,
    amount,
    status,
    currency,
    arrivalTs
  } = payoutData.value
  return [
    {
      id,
      createdTs: new Date(createdTs * 1000).toLocaleString(),
      amount: `${currency}${amount / 100}`,
      status,
      currency,
      arrivalTs: arrivalTs ? new Date(arrivalTs * 1000).toLocaleString() : ''
    }
  ]
})

const payoutItemRows = computed(() => {
  return payoutItemDetails.value.map((row: any) => {
    const {
      commissionId,
      createdTs,
      amount,
      currency,
      description,
      status,
      metadata
    } = row
    return {
      commissionId,
      createdTs: new Date(createdTs * 1000).toLocaleString(),
      amount: `${currency}${amount / 100}`,
      currency,
      description,
      status,
      metadata: JSON.stringify(metadata)
    }
  })
})

onMounted(async () => {
  try {
    isLoading.value = true
    const { data, error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/user/payouts/${payoutId.value}`,
      {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      })
    if (fetchError.value) {
      if (fetchError.value.statusCode === 403) {
        error.value = 'NOT_OWNER_OF_NFT_CLASS'
      } else {
        error.value = fetchError.value.toString()
      }
    } else {
      payoutData.value = (data.value as any)
      if (payoutData.value.items) {
        payoutItemDetails.value = payoutData.value.items
      }
    }
  } finally {
    isLoading.value = false
  }
})
</script>
