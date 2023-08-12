<template>
  <div>
    <h1>Setup readership plans for your readers</h1>
    <div v-if="error" style="color: red">
      {{ error }}
    </div>
    <div v-if="isLoading" style="color: green">
      Loading...
    </div>
    <hr>
    <section v-if="bookStoreApiStore.isAuthenticated">
      <section v-if="!connectStatus?.isReady">
        <NuxtLink :to="{ name: 'nft-book-store-user' }">
          Please setup stripe connect first
        </NuxtLink>
      </section>
      <section v-else>
        <h2>Your current plans</h2>
        <table>
          <tr>
            <td>price id</td>
            <td>name</td>
            <td>description</td>
            <td>price</td>
            <td>free mint WNFT</td>
            <td>current subscribers</td>
          </tr>
          <tr v-for="p in plansInfo" :key="p.id">
            <td>{{ p?.stripePriceId }}</td>
            <td>{{ p?.name.en }}</td>
            <td>
              <md-preview :editor-id="p.stripePriceId" :model-value="p?.description.en" />
            </td>
            <td>{{ p?.priceInDecimal / 100 }}</td>
            <td>{{ p?.canFreeCollectWNFT }}</td>
            <td>{{ subscriberInfo.filter(s => s.priceId === p.stripePriceId).length }}</td>
          </tr>
        </table>
        <hr>
        <section>
          <h2>Create new plan</h2>
          <p><label>Price(USD) of new subscription plan (Minimal ${{ MINIMAL_PRICE }})</label></p>
          <input v-model="newPlanPrice" type="number" step="0.01" :min="MINIMAL_PRICE">
          <p><label>Name of new subscription plan</label></p>
          <input v-model="newPlanNameEn" placeholder="Product name in English"><br>
          <input v-model="newPlanNameZh" placeholder="產品中文名字">
          <p><label>Description of new subscription plan</label></p>
          <md-editor
            v-model="newPlanDescriptionEn"
            language="en-US"
            editor-id="en-01"
            placeholder="Product description in English"
            :toolbars="toolbarOptions"
            :sanitize="sanitizeHtml"
          />
          <md-editor
            v-model="newPlanDescriptionZh"
            language="en-US"
            editor-id="zh-01"
            placeholder="產品中文描述"
            :toolbars="toolbarOptions"
            :sanitize="sanitizeHtml"
          />
          <p>
            <input v-model="newPlanCanCollectFreeWNFT" type="checkbox">
            <label>Allow subscriber to mint WNFT for free</label>
          </p>
          <button @click="onClickNewPlan">
            Create
          </button>
        </section>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { MdEditor, config, MdPreview } from 'md-editor-v3'
import { useBookStoreApiStore } from '~/stores/book-store-api'
import { useWalletStore } from '~/stores/wallet'
import { LIKE_CO_API } from '~/constant'
import { escapeHtml, sanitizeHtml } from '~/utils/index'
import 'md-editor-v3/lib/style.css'

const walletStore = useWalletStore()
const bookStoreApiStore = useBookStoreApiStore()
const { wallet } = storeToRefs(walletStore)
const { token } = storeToRefs(bookStoreApiStore)

const MINIMAL_PRICE = 0.9

const error = ref('')
const isLoading = ref(false)
const connectStatus = ref<any>({})
const plansInfo = ref<any[]>([])
const subscriberInfo = ref<any[]>([])

const newPlanPrice = ref<any>(undefined)
const newPlanNameEn = ref<string>('')
const newPlanNameZh = ref<string>('')
const newPlanDescriptionEn = ref<string>('')
const newPlanDescriptionZh = ref<string>('')
const newPlanCanCollectFreeWNFT = ref(true)

const toolbarOptions = ref<string[]>([
  'bold',
  'italic',
  'strikeThrough',
  'title',
  '-',
  'unorderedList',
  'orderedList',
  '-',
  'code',
  'link',
  '=',
  'preview'
])

config({
  markdownItConfig (mdit: any) {
    mdit.options.html = false
  }
})

watch(isLoading, (newIsLoading) => {
  if (newIsLoading) { error.value = '' }
})

onMounted(async () => {
  try {
    isLoading.value = true
    const { data, error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/book/user/connect/status?wallet=${wallet.value}`,
      {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    )
    if (fetchError.value && fetchError.value?.statusCode !== 404) {
      throw new Error(fetchError.value.toString())
    }
    connectStatus.value = (data.value as any) || {}
    await refreshPlans()
  } catch (e) {
    console.error(e)
    error.value = (e as Error).toString()
  } finally {
    isLoading.value = false
  }
})

async function refreshPlans () {
  const [
    { data: plansData, error: fetchPlanError },
    { data: subscriberData, error: fetchSubscriberError }
  ] = await Promise.all([
    useFetch(`${LIKE_CO_API}/likernft/subscription/creators/${wallet.value}/plans`,
      {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    ),
    useFetch(`${LIKE_CO_API}/likernft/subscription/creators/${wallet.value}/subscribers`,
      {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    )
  ])
  if (fetchPlanError.value && fetchPlanError.value?.statusCode !== 404) {
    throw new Error(fetchPlanError.value.toString())
  }
  if (fetchSubscriberError.value && fetchSubscriberError.value?.statusCode !== 404) {
    throw new Error(fetchSubscriberError.value.toString())
  }
  plansInfo.value = ((plansData.value as any) || {})?.plans
  subscriberInfo.value = ((subscriberData.value as any) || {})?.readers
}

function initPlan () {
  newPlanPrice.value = undefined
  newPlanNameEn.value = ''
  newPlanNameZh.value = ''
  newPlanDescriptionEn.value = ''
  newPlanDescriptionZh.value = ''
  newPlanCanCollectFreeWNFT.value = true
}

async function onClickNewPlan () {
  try {
    isLoading.value = true
    const { error: fetchError } = await useFetch(`${LIKE_CO_API}/likernft/subscription/creators/${wallet.value}/plans`,
      {
        method: 'POST',
        body: {
          priceInDecimal: Math.round(newPlanPrice.value * 100),
          name: { en: newPlanNameEn.value, zh: newPlanNameZh.value },
          description: { en: escapeHtml(newPlanDescriptionEn.value), zh: escapeHtml(newPlanDescriptionZh.value) },
          canFreeCollectWNFT: newPlanCanCollectFreeWNFT.value
        },
        headers: {
          authorization: `Bearer ${token.value}`
        }
      }
    )
    if (fetchError.value) {
      throw new Error(fetchError.value.toString())
    }
    await refreshPlans()
  } catch (e) {
    console.error(e)
    error.value = e.toString()
  } finally {
    initPlan()
    isLoading.value = false
  }
}

</script>
