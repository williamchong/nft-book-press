import { defineStore } from 'pinia'

import { FetchLikerInfoResult } from 'utils/api'

export const useLikerStore = defineStore('liker', () => {
  const likerInfoMapById = ref({} as Record<string, FetchLikerInfoResult>)
  const likerInfoMapByWallet = ref({} as Record<string, FetchLikerInfoResult>)

  const getLikerInfoById = computed(() => (likerId: string) => {
    return likerInfoMapById.value[likerId] || null
  })

  const getLikerInfoByWallet = computed(() => (wallet: string) => {
    return likerInfoMapByWallet.value[wallet] || null
  })

  const getChannelInfoById = computed(() => (channelId: string) => {
    const likerId = convertChannelIdToLikerId(channelId)
    return getLikerInfoById.value(likerId)
  })

  async function fetchLikerInfoById (likerId: string) {
    try {
      const result = await useFetchLikerInfoById(likerId)
      if (result.error.value) {
        throw result.error.value
      }
      const likerInfo = result.data.value
      if (!likerInfo) {
        throw new Error('Missing data in `fetchLikerInfoById`')
      }
      likerInfoMapById.value[likerId] = likerInfo
      likerInfoMapByWallet.value[likerInfo.likeWallet] = likerInfo
      return likerInfo
    } catch {
      return null
    }
  }

  async function lazyFetchLikerInfoById (likerId: string) {
    if (likerInfoMapById.value[likerId]) {
      return likerInfoMapById.value[likerId]
    }

    const likerInfo = await fetchLikerInfoById(likerId)
    return likerInfo
  }

  async function fetchLikerInfoByWallet (wallet: string, { nocache = false } = {}) {
    try {
      const result = await useFetchLikerInfoByWallet(wallet, { nocache })
      if (result.error.value) {
        throw result.error.value
      }
      const likerInfo = result.data.value
      if (!likerInfo) {
        throw new Error('Missing data in `fetchLikerInfoByWallet`')
      }
      likerInfoMapByWallet.value[wallet] = likerInfo
      likerInfoMapById.value[likerInfo.user] = likerInfo
      return likerInfo
    } catch {
      return null
    }
  }

  async function lazyFetchLikerInfoByWallet (wallet: string) {
    if (likerInfoMapByWallet.value[wallet]) {
      return likerInfoMapByWallet.value[wallet]
    }

    const likerInfo = await fetchLikerInfoByWallet(wallet)
    return likerInfo
  }

  async function lazyFetchChannelInfoById (channelId: string) {
    const likerId = convertChannelIdToLikerId(channelId)
    const result = await lazyFetchLikerInfoById(likerId)
    return result
  }

  return {
    getLikerInfoById,
    getLikerInfoByWallet,
    getChannelInfoById,
    fetchLikerInfoById,
    lazyFetchLikerInfoById,
    fetchLikerInfoByWallet,
    lazyFetchLikerInfoByWallet,
    lazyFetchChannelInfoById
  }
})
