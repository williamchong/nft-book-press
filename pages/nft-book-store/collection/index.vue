<template>
  <main class="space-y-4">
    <UAlert
      v-if="error"
      class="mt-4"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      :title="`${error}`"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link', padded: false }"
      @close="error = ''"
    />

    <UProgress v-if="isLoading" animation="carousel">
      <template #indicator>
        Loading...
      </template>
    </UProgress>

    <UCard :ui="{ header: { base: 'flex justify-between items-center gap-4' } }">
      <template #header>
        <h2 class="text-xl font-bold font-mono">
          NFT Book Collections
        </h2>

        <UButton icon="i-heroicons-plus-circle" label="New Collection" :to="{ name: 'nft-book-store-collection-new' }" />
      </template>

      <UCard
        :ui="{
          header: { base: 'flex justify-between items-center gap-4' },
          body: {
            base: 'divide-y divide-gray-200 dark:divide-gray-700',
            padding: '',
          },
        }"
      >
        <template #header>
          <h2 class="font-bold font-mono">
            Current book collections
          </h2>
        </template>

        <!-- Table -->
        <UTable
          :columns="tableColumns"
          :rows="tableRows"
          @select="selectTableRow"
        />
      </UCard>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { useNftStore } from '~/stores/nft'

const router = useRouter()
const bookStoreApiStore = useBookStoreApiStore()
const nftStore = useNftStore()
const { listNFTBookCollections } = bookStoreApiStore
const { getClassMetadataById, lazyFetchClassMetadataById } = nftStore

const error = ref('')
const isLoading = ref(false)
const collectionList = ref<any[]>([])

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

const tableColumns = [
  {
    key: 'name',
    label: 'Collection Name',
    sortable: true
  },
  {
    key: 'priceInUSD',
    label: 'Price in USD',
    sortable: true
  },
  {
    key: 'pendingAction',
    label: 'Pending Action',
    sortable: true
  },
  {
    key: 'sold',
    label: 'Sold',
    sortable: true
  },
  {
    key: 'stock',
    label: 'Remaining Stock',
    sortable: true
  }
]

onMounted(async () => {
  const data = await listNFTBookCollections()
  collectionList.value = (data.value as any)?.list
  collectionList.value.forEach((b :any) => {
    b.classIds.forEach((classId: string) => lazyFetchClassMetadataById(classId))
  })
})

const tableRows = computed(() => collectionList.value.map(b => ({
  collectionId: b.id,
  name: b.name?.en,
  priceInUSD: b.typePayload?.priceInDecimal / 100,
  classIds: b.classIds,
  classNames: b.classIds?.map((classId :string) => getClassMetadataById(classId)?.name),
  pendingAction: b.typePayload?.pendingNFTCount,
  sold: b.typePayload?.sold,
  stock: b.typePayload?.stock
})))

function selectTableRow (row: any) {
  router.push({
    name: 'nft-book-store-collection-status-collectionId',
    params: { collectionId: row.collectionId }
  })
}

</script>
