import { defineStore } from 'pinia'

import { FetchLikerInfoByIdResult } from 'utils/api'

export const useStaticDataStore = defineStore('static-data', () => {
  const likerUserInfoMap = ref({} as Record<string, FetchLikerInfoByIdResult>)

  const getLikerInfoById = computed(() => (likerId: string) => {
    return likerUserInfoMap.value[likerId]
  })

  const getChannelInfoById = computed(() => (channelId: string) => {
    const likerId = convertChannelIdToLikerId(channelId)
    return getLikerInfoById.value(likerId)
  })

  async function lazyFetchLikerInfoById (likerId: string) {
    if (likerUserInfoMap.value[likerId]) {
      return likerUserInfoMap.value[likerId]
    }

    try {
      const result = await fetchLikerInfoById(likerId)
      if (result.error.value) {
        throw result.error.value
      }
      const userInfo = result.data.value
      if (!userInfo) {
        throw new Error('Missing data in `fetchLikerInfoById`')
      }
      likerUserInfoMap.value[likerId] = userInfo
      return userInfo
    } catch {
      return null
    }
  }

  async function lazyFetchChannelInfoById (channelId: string) {
    const likerId = convertChannelIdToLikerId(channelId)
    const result = await lazyFetchLikerInfoById(likerId)
    return result
  }

  return {
    getLikerInfoById,
    getChannelInfoById,
    lazyFetchLikerInfoById,
    lazyFetchChannelInfoById
  }
})
