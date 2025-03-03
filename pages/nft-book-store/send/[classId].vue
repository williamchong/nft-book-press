<template>
  <PageBody>
    <h1 class="text-lg font-bold font-mono">
      Deliver NFT Book "{{ nftClassName || classId }}"
    </h1>

    <UAlert
      v-if="error"
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

    <UCard
      v-if="bookStoreApiStore.isAuthenticated"
      :ui="{
        body: { base: 'space-y-4' },
        footer: { base: 'flex justify-center gap-2' }
      }"
    >
      <UCard :ui="{ body: { padding: '' } }">
        <table class="divide-y w-full">
          <tbody>
            <tr>
              <th class="text-left px-4 py-3">
                Buyer Email
              </th><td class="px-4 py-3">
                {{ orderInfo.email }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Reader Email
              </th><td class="px-4 py-3">
                {{ orderInfo.giftInfo?.toEmail || orderInfo.email }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Status
              </th><td class="px-4 py-3">
                {{ orderInfo.status }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Buyer Wallet
              </th><td class="px-4 py-3">
                {{ orderInfo.wallet }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Price Name
              </th><td class="px-4 py-3">
                {{ orderInfo.priceName }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Price
              </th><td class="px-4 py-3">
                {{ orderInfo.price }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Quantity
              </th><td class="px-4 py-3">
                {{ orderInfo.quantity }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Buyer message
              </th><td class="px-4 py-3">
                {{ orderInfo.message }}
              </td>
            </tr>
            <tr>
              <th class="text-left px-4 py-3">
                Sales channel
              </th><td class="px-4 py-3">
                {{ orderInfo.from }}
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>

      <UFormGroup
        label="Enter Author's Message"
        :error="isLimitReached"
        :hint="`${messageCharCount} / ${AUTHOR_MESSAGE_LIMIT}`"
      >
        <UTextarea
          v-model="memo"
          placeholder="default memo"
        />
      </UFormGroup>

      <UFormGroup
        label="Specify NFT ID"
        :error="nftIdError"
      >
        <div class="flex flex-wrap items-center justify-center gap-2">
          <template v-if="orderInfo.quantity === 1">
            <UInput
              ref="nftIdInputRef"
              v-model="nftId"
              class="font-mono flex-grow"
              :readonly="!isEditingNFTId"
              :disabled="!isEditingNFTId"
              placeholder="Leave empty to auto-fetch NFT ID"
              :trailing-icon="nftIdError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
            />
            <UButton
              :label="isEditingNFTId || (isVerifyingNFTId && !isAutoFetchingNFTId) ? 'Confirm' : 'Edit'"
              :disabled="isLoading || isVerifyingNFTId"
              variant="outline"
              :loading="isVerifyingNFTId && !isAutoFetchingNFTId"
              color="gray"
              @click="handleClickEditNFTId"
            />
            <UDivider class="text-sm text-gray-600 sm:w-min">
              OR
            </UDivider>
          </template>
          <UButton
            :label="`Auto-fetch NFT ID for ${orderInfo.quantity} NFTs`"
            :disabled="isLoading || isEditingNFTId"
            :loading="isAutoFetchingNFTId"
            variant="outline"
            @click="onClickFetchNextNFTId"
          />
        </div>
      </UFormGroup>

      <PlaceholderCard class="h-[300px]">
        <img
          v-if="nftImage"
          class="max-w-[180px] w-full h-full object-contain"
          :src="nftImage"
        >
      </PlaceholderCard>

      <template #footer>
        <UButton
          label="Sign and Send"
          :disabled="isSendButtonDisabled"
          size="xl"
          @click="onSendNFTStart"
        />
      </template>
    </UCard>
  </PageBody>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { waitForTransactionReceipt } from '@wagmi/vue/actions'
import { useWriteContract } from '@wagmi/vue'
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { useWalletStore } from '~/stores/wallet'
import { useNftStore } from '~/stores/nft'
import { parseImageURLFromMetadata } from '~/utils'
import { useMessageCharCount } from '~/composables/useMessageCharCount'
import { AUTHOR_MESSAGE_LIMIT } from '~/constant'
import { LIKE_NFT_CLASS_ABI } from '~/contracts/likeNFT'
import { config } from '~/utils/wagmi/config'

const { LIKE_CO_API } = useRuntimeConfig().public

const store = useWalletStore()
const { wallet, signer } = storeToRefs(store)
const { initIfNecessary } = store

const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const nftStore = useNftStore()
const { lazyFetchClassMetadataById } = nftStore

const route = useRoute()
const router = useRouter()

const { writeContractAsync } = useWriteContract()
const { getBalanceOf, getTokenIdByOwnerIndex } = useNFTContractReader()

const error = ref('')
const isLoading = ref(false)
const classId = ref(route.params.classId as string)
const paymentId = ref(route.query.payment_id as string)
const ownerWallet = ref(route.query.owner_wallet as string || wallet.value)
const memo = ref('')
const { messageCharCount, isLimitReached } = useMessageCharCount(memo, AUTHOR_MESSAGE_LIMIT)
const { getNFTMetadata, getNFTOwner } = useNFTContractReader()

const nftId = ref('')
const nftIds = ref([] as string[])
const isVerifyingNFTId = ref(false)
const isAutoFetchingNFTId = ref(false)
const nftIdError = ref('')
const isEditingNFTId = ref(false)
const nftIdInputRef = ref<any>(undefined)

const orderInfo = ref<any>({})
const nftImage = ref('')

const tokenId = computed(() => parseInt(nftId.value, 10))
const isSendButtonDisabled = computed(() => isEditingNFTId.value || isLoading.value || isVerifyingNFTId.value || isAutoFetchingNFTId.value || !!nftIdError.value || isLimitReached.value)

const nftClassName = computed(() => nftStore.getClassMetadataById(classId.value as string)?.name)

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

watch(nftId, (newNftId) => {
  nftIdError.value = ''
  if (nftIds.value[0]) {
    nftIds.value[0] = newNftId
  }
})

watch(isEditingNFTId, async (isEditing) => {
  if (isEditing) { return }

  if (nftId.value) {
    await fetchNFTMetadata()
  } else {
    nftImage.value = ''
  }
})

onMounted(async () => {
  const data = await $fetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/status/${paymentId.value}`,
    {
      headers: {
        authorization: `Bearer ${token.value}`
      }
    })
  orderInfo.value = (data as any)
  lazyFetchClassMetadataById(classId.value as string)
  fetchNextNFTId(orderInfo.value.quantity || 1)
})

function handleClickEditNFTId () {
  isEditingNFTId.value = !isEditingNFTId.value
  nftIdError.value = ''
  nextTick(() => {
    if (isEditingNFTId.value) {
      nftIdInputRef.value?.$refs?.input?.focus()
    }
  })
}

async function fetchNFTMetadata () {
  try {
    isVerifyingNFTId.value = true
    const metadata = await getNFTMetadata(classId.value, tokenId.value)
    nftImage.value = parseImageURLFromMetadata(metadata)
  } catch (err) {
    error.value = (err as Error).toString()
  } finally {
    isVerifyingNFTId.value = false
  }
}

async function fetchNextNFTId (_count = 1) {
  try {
    nftIdError.value = ''
    isAutoFetchingNFTId.value = true
    if (!wallet.value || !signer.value) {
      await initIfNecessary()
    }
    if (!ownerWallet.value) { return }
    const balance = await getBalanceOf(classId.value, ownerWallet.value) as number
    if (balance < _count) {
      throw new Error(`Insufficient balance of NFT classId: ${classId.value} for wallet: ${ownerWallet.value}`)
    }

    for (let i = 0; i < _count; i++) {
      const nextNftId = await getTokenIdByOwnerIndex(classId.value, ownerWallet.value, i)
      nftIds.value.push(nextNftId as string)
    }
    nftId.value = nftIds.value[0]
  } catch (err) {
    error.value = (err as Error).toString()
  } finally {
    isAutoFetchingNFTId.value = false
  }
}

function onClickFetchNextNFTId () {
  fetchNextNFTId(orderInfo.value.quantity || 1)
}

async function onSendNFTStart () {
  if (isSendButtonDisabled.value) { return }
  try {
    isLoading.value = true
    if (!wallet.value || !signer.value) {
      await initIfNecessary()
    }
    if (!wallet.value || !signer.value) { return }
    if (nftId.value) {
      const owner = await getNFTOwner(classId.value, tokenId.value)
      if (owner !== ownerWallet.value) {
        throw new Error(`NFT classId: ${classId} nftId:${nftId} is not owned by sender!`)
      }
    } else {
      await fetchNextNFTId(orderInfo.value.quantity)
    }

    let receipt
    let txHash
    for (const nftId of nftIds.value) {
      txHash = await writeContractAsync({
        address: classId.value as any,
        abi: LIKE_NFT_CLASS_ABI,
        functionName: 'transferWithMemo',
        args: [
          wallet.value,
          orderInfo.value.wallet,
          nftId,
          memo.value
        ]
      })
      receipt = await waitForTransactionReceipt(config, { hash: txHash })
    }
    if (receipt?.status === 'success') {
      await $fetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/sent/${paymentId.value}`,
        {
          method: 'POST',
          body: {
            txHash,
            quantity: orderInfo.value.quantity || 1
          },
          headers: {
            authorization: `Bearer ${token.value}`
          }
        })

      router.push({
        name: 'nft-book-store-status-classId',
        params: {
          classId: classId.value
        }
      })
    }
  } catch (err) {
    console.error(err)
    error.value = (err as Error).toString()
  } finally {
    isLoading.value = false
  }
}

</script>
