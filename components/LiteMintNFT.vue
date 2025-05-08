<template>
  <div class="flex flex-col items-stretch grow space-y-4">
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      :title="`${error}`"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link', padded: false }"
      @close="error = ''"
    />

    <UCard
      class="flex-1"
      :ui="{ body: { base: 'space-y-4' } }"
    >
      <template #header>
        <h3 class="font-bold">
          Mint NFT by filling required information
        </h3>
      </template>

      <NFTMintForm
        ref="formRef"
        v-model="formState"
      />

      <div v-if="isLoading" class="w-full">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <UBadge color="Badge" variant="soft">
              Minting NFT
            </UBadge>
            <p class="text-xs text-gray-500">
              請勿關閉此視窗，直到操作完成。
            </p>
          </div>
          <UProgress
            animation="carousel"
            color="primary"
            class="w-full"
          />
        </div>
      </div>
      <div v-if="shouldShowSubmit" class="flex justify-center">
        <UButton
          label="Submit"
          :loading="isLoading"
          size="lg"
          :disabled="isLoading"
          @click="onClickMintByInputting"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useWriteContract } from '@wagmi/vue'
import { storeToRefs } from 'pinia'
import { waitForTransactionReceipt } from '@wagmi/vue/actions'
import { hexToNumber } from 'viem'

import { useWalletStore } from '~/stores/wallet'
import { DEFAULT_MAX_SUPPLY, NFT_DEFAULT_MINT_AMOUNT } from '~/constant'
import { LIKE_NFT_CLASS_ABI } from '~/contracts/likeNFT'
import { config } from '~/utils/wagmi/config'

const route = useRoute()
const toast = useToast()
const { writeContractAsync } = useWriteContract()
const {
  getClassOwner,
  getClassMetadata,
  checkNFTClassIsBookNFT
} = useNFTContractReader()

const store = useWalletStore()
const { wallet } = storeToRefs(store)
const { initIfNecessary } = store

const error = ref('')
const isLoading = ref(false)

const iscnData = ref<any>(null)

const nftMintListData = ref<any>([])
const nftMintDefaultData = ref<any>(null)
const iscnOwner = ref('')

const classId = ref<string>(route.params.classId as string || '')

const formState = reactive({
  mintCount: NFT_DEFAULT_MINT_AMOUNT,
  imageUrl: '',
  externalUrl: '',
  maxSupply: DEFAULT_MAX_SUPPLY
})

const formRef = ref()

const isFormValid = computed(() => {
  return formRef.value?.validate(formState).length === 0
})

const emit = defineEmits(['submit'])
const iscnId = ref('')

const props = defineProps({
  iscnData: {
    type: Object,
    default: null
  },
  shouldShowSubmit: {
    type: Boolean,
    default: true
  }
})

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

watch(() => props.iscnData, (recordData) => {
  if (recordData) {
    iscnData.value = recordData
    iscnId.value = recordData['@id']
    classId.value = recordData['@id']
    iscnOwner.value = recordData.owner
    formState.imageUrl = recordData.contentMetadata?.thumbnailUrl || ''
  }
}, { immediate: true })

function generateNFTMintListData ({
  nftMintCount,
  imgUrl
}: {
  nftMintCount: number;
  imgUrl: string;
}) {
  const dataRows = []
  for (let i = 0; i < nftMintCount; i++) {
    dataRows.push({
      image: imgUrl,
      metadata: ''
    })
  }
  return dataRows
}

async function onClickMintByInputting () {
  try {
    isLoading.value = true
    const { contentMetadata } = iscnData.value

    if (!isFormValid.value) {
      toast.add({
        icon: 'i-heroicons-exclamation-circle',
        title: `Required field missing: ${error.value}`,
        timeout: 3000,
        color: 'red'
      })
      return
    }

    const nftsDefaultData = {
      metadata: {
        name: contentMetadata.name,
        description: contentMetadata.description,
        symbol: 'BOOK',
        ...contentMetadata,
        image: formState.imageUrl,
        external_url: formState.externalUrl
      }
    }

    if (typeof formState.mintCount !== 'number') {
      formState.mintCount = Number(formState.mintCount)
    }

    nftMintDefaultData.value = nftsDefaultData
    nftMintListData.value = generateNFTMintListData({
      nftMintCount: formState.mintCount,
      imgUrl: formState.imageUrl
    })
    formState.mintCount = nftMintListData.value.length

    if (formState.mintCount > 0) {
      await onMintNFTStart()
    }
    if (classId.value) {
      emit('submit', {
        classId: classId.value,
        nftMintCount: formState.mintCount
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    toast.add({
      icon: 'i-heroicons-exclamation-circle',
      title: (error as Error).toString(),
      timeout: 0,
      color: 'red',
      ui: {
        title: 'text-red-400 dark:text-red-400'
      }
    })
  } finally {
    isLoading.value = false
  }
}

async function onMintNFTStart () {
  try {
    isLoading.value = true
    if (!wallet.value) {
      await initIfNecessary()
    }
    if (!wallet.value) { return }
    if (!nftMintDefaultData.value) { throw new Error('NO_MINT_DATA') }
    const defaultMetadata = nftMintDefaultData.value.metadata
    const nfts = [...Array(formState.mintCount).keys()].map((i) => {
      const {
        image: dataImage,
        metadata: dataMetadataString,
        ...otherData
      } = nftMintListData?.value?.[i] || {}
      const dataMetadata = JSON.parse(dataMetadataString || '{}')
      const data = { attributes: [], ...defaultMetadata, ...dataMetadata }
      if (dataImage) { data.image = dataImage }
      if (data.author) {
        data.attributes.push({
          trait_type: 'Author',
          value: data.author
        })
      }
      if (data.publisher) {
        data.attributes.push({
          trait_type: 'Publisher',
          value: data.publisher
        })
      }
      if (data.datePublished) {
        data.attributes.push({
          trait_type: 'Publish Date',
          display_type: 'date',
          value: (new Date(data.datePublished)).getTime() || 0
        })
      }
      Object.entries(otherData).forEach(([key, value]) => {
        if (value) {
          try {
            data[key] = JSON.parse(value as string)
          } catch (err) {
            data[key] = value
          }
        }
      })
      return {
        id: -1,
        metadata: data
      }
    })
    const res = await writeContractAsync({
      address: classId.value as `0x${string}`,
      abi: LIKE_NFT_CLASS_ABI,
      functionName: 'batchMint',
      args: [
        Array(formState.mintCount).fill(wallet.value),
        Array(formState.mintCount).fill(''),
        nfts.map(nft => JSON.stringify({
          image: nft.metadata.image,
          image_data: '',
          external_url: nft.metadata.external_url || '',
          description: nft.metadata.description || '',
          name: nft.metadata.name || '',
          attributes: nft.metadata.attributes || [],
          background_color: '',
          animation_url: '',
          youtube_url: ''
        }))
      ]
    })
    const receipt = await waitForTransactionReceipt(config, { hash: res })
    // eslint-disable-next-line no-console
    console.log(receipt)
    if (!receipt || receipt.status !== 'success') { throw new Error('INVALID_RECEIPT') }
    if (receipt.logs[0].topics[3] === undefined) { throw new Error('INVALID_NFT_ID') }
    receipt.logs.forEach((log) => {
      if (log.topics[3] !== undefined) {
        const nftId = hexToNumber(log.topics[3])
        nfts[nftId].id = nftId
      }
    })
  } catch (err) {
    throw new Error('MINT_NFT_ERROR:' + (err as Error).toString())
  } finally {
    isLoading.value = false
  }
}

async function onISCNIDInput (value: string) {
  isLoading.value = true
  try {
    iscnId.value = value
    const isBookNFT = await checkNFTClassIsBookNFT(value)
    if (!isBookNFT) {
      throw new Error('Invalid NFT Class ID')
    }
    const [data, owner] = await Promise.all([
      getClassMetadata(value),
      getClassOwner(value)
    ])
    if (!data) {
      throw new Error('Invalid NFT Class ID')
    }
    iscnData.value = { contentMetadata: data, owner, '@id': value }
    formState.imageUrl = iscnData.value.contentMetadata?.thumbnailUrl || ''
    classId.value = value
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  isLoading,
  isFormValid,
  onISCNIDInput,
  onClickMintByInputting
})

</script>
