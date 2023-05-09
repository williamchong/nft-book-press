<template>
  <div>
    <h1>Deliver NFT Book {{ classId }}</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="bookStoreApiStore.isAuthenticated">
      <table>
        <tr>
          <td>email</td>
          <td>status</td>
          <td>wallet</td>
          <td>buyer message</td>
          <td>sales channel</td>
        </tr>
        <tr>
          <td>{{ orderInfo.email }}</td>
          <td>{{ orderInfo.status }}</td>
          <td>{{ orderInfo.wallet }}</td>
          <td>{{ orderInfo.message }}</td>
          <td>{{ orderInfo.from }}</td>
        </tr>
      </table>
      <hr>
      <p><label>Enter Author's Message (optional)</label></p>
      <input v-model="memo" placeholder="default memo">
      <p><label>Enter NFT ID (optional)</label></p>
      <input v-model="nftId" placeholder="default memo">
      <button :disabled="isLoading" style="margin-top: 16px" @click="onSendNFTStart">
        Sign and Send
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DeliverTxResponse } from '@cosmjs/stargate'
import { storeToRefs } from 'pinia'
import { LIKE_CO_API } from '~/constant'
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { useWalletStore } from '~/stores/wallet'

const store = useWalletStore()
const { wallet, signer } = storeToRefs(store)
const { connect } = store

const bookStoreApiStore = useBookStoreApiStore()
const { token } = storeToRefs(bookStoreApiStore)

const route = useRoute()
const router = useRouter()

const error = ref('')
const isLoading = ref(false)
const classId = ref(route.params.classId as string)
const paymentId = ref(route.query.payment_id as string)
const memo = ref('')
const nftId = ref('')
const orderInfo = ref<any>({})

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  const { data, error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/status/${paymentId.value}`,
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
  }
  orderInfo.value = (data.value as any)
})

async function onSendNFTStart () {
  try {
    isLoading.value = true
    if (!wallet.value || !signer.value) {
      await connect()
    }
    if (!wallet.value || !signer.value) { return }
    let targetNftId = ''
    if (nftId.value) {
      const { owner } = await getNFTOwner(classId.value, nftId.value)
      if (owner !== wallet.value) {
        throw new Error(`NFT classId: ${classId} nftId:${nftId} is not owned by sender!`)
      }
      targetNftId = nftId.value
    } else {
      const { nfts } = await getNFTs({
        classId: classId.value,
        owner: wallet.value,
        needCount: 1
      })
      if (!nfts.length) {
        throw new Error(`Sender does not own any class id: ${classId.value} `)
      }
      targetNftId = nfts[0].id
    }

    const signingClient = await getSigningClientWithSigner(signer.value)
    const client = signingClient.getSigningStargateClient()
    if (!client) { throw new Error('Signing client not exists') }

    const res = await signingClient.sendNFTs(
      wallet.value,
      orderInfo.value.wallet,
      classId.value,
      [targetNftId],
      { memo: memo.value }
    ) as DeliverTxResponse

    if (res.transactionHash && res.code === 0) {
      const { error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/purchase/${classId.value}/sent/${paymentId.value}`,
        {
          method: 'POST',
          body: { txHash: res.transactionHash },
          headers: {
            authorization: `Bearer ${token.value}`
          }
        })
      if (fetchError.value) {
        throw fetchError.value
      }
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
